import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmployeeForm, buildEmployeePayload, employeeSchema } from './EmployeeForm';
import type { Employee } from '../../features/users/types';

const base = { name: 'Ada Lovelace', email: 'ada@x.com', department: '', title: '', status: 'active' as const, managerId: '', roleId: '', password: '' };

describe('buildEmployeePayload', () => {
  it('omits empty optional fields on create', () => {
    expect(buildEmployeePayload(base, false)).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@x.com',
      status: 'active',
      managerId: null,
    });
  });

  it('sends empty strings on update so fields can be cleared, plus the required name and email', () => {
    expect(buildEmployeePayload(base, true)).toEqual({
      name: 'Ada Lovelace',
      email: 'ada@x.com',
      department: '',
      title: '',
      status: 'active',
      managerId: null,
    });
  });
});

describe('role in payloads', () => {
  it('includes roleId only when one is chosen', () => {
    expect(buildEmployeePayload({ ...base, roleId: 'r1' }, false)).toMatchObject({ roleId: 'r1' });
    expect(buildEmployeePayload({ ...base, roleId: 'r1' }, true)).toMatchObject({ roleId: 'r1' });
    expect(buildEmployeePayload(base, true)).not.toHaveProperty('roleId');
  });
});

describe('password in payloads', () => {
  it('sends the password only on create and only when provided', () => {
    expect(buildEmployeePayload({ ...base, password: 'longenough1' }, false)).toMatchObject({ password: 'longenough1' });
    expect(buildEmployeePayload({ ...base, password: 'longenough1' }, true)).not.toHaveProperty('password');
    expect(buildEmployeePayload(base, false)).not.toHaveProperty('password');
  });
});

describe('employeeSchema (mirrors backend rules)', () => {
  it('requires name 2-120 and a valid email', () => {
    expect(employeeSchema.safeParse({ ...base, name: 'A' }).success).toBe(false);
    expect(employeeSchema.safeParse({ ...base, name: 'A'.repeat(121) }).success).toBe(false);
    expect(employeeSchema.safeParse({ ...base, email: 'nope' }).success).toBe(false);
    expect(employeeSchema.safeParse(base).success).toBe(true);
  });

  it('allows blank department/title but not a single character', () => {
    expect(employeeSchema.safeParse({ ...base, department: 'S' }).success).toBe(false);
    expect(employeeSchema.safeParse({ ...base, title: 'T' }).success).toBe(false);
    expect(employeeSchema.safeParse({ ...base, department: 'Support', title: 'Agent' }).success).toBe(true);
  });

  it('accepts an empty password but rejects one shorter than 8 characters', () => {
    expect(employeeSchema.safeParse({ ...base, password: 'short' }).success).toBe(false);
    expect(employeeSchema.safeParse({ ...base, password: 'longenough1' }).success).toBe(true);
  });

  it('rejects unknown statuses', () => {
    expect(employeeSchema.safeParse({ ...base, status: 'inactive' }).success).toBe(false);
  });
});

describe('EmployeeForm', () => {
  const existing = {
    _id: 'e1',
    name: 'Ada Lovelace',
    email: 'ada@x.com',
    department: 'Support',
    title: 'Agent',
    status: 'invited',
    managerId: null,
  } as Employee;

  it('shows field errors and does not submit invalid input', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <EmployeeForm open onOpenChange={() => {}} onSubmit={onSubmit} managers={[]} isPending={false} errorMessage={null} />
    );
    await user.click(screen.getByRole('button', { name: /create employee/i }));
    expect(await screen.findByText('Name must be at least 2 characters')).toBeInTheDocument();
    expect(screen.getByText('A valid email is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('prefills edit mode from the selected employee', () => {
    render(
      <EmployeeForm
        open
        onOpenChange={() => {}}
        onSubmit={vi.fn()}
        initial={existing}
        managers={[]}
        isPending={false}
        errorMessage={null}
      />
    );
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByLabelText(/name \*/i)).toHaveValue('Ada Lovelace');
    expect(within(dialog).getByLabelText(/department/i)).toHaveValue('Support');
    expect(within(dialog).getByLabelText(/status/i)).toHaveValue('invited');
    expect(within(dialog).getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('disables actions while pending and shows a server error', () => {
    render(
      <EmployeeForm open onOpenChange={() => {}} onSubmit={vi.fn()} managers={[]} isPending errorMessage="Email taken" />
    );
    expect(screen.getByRole('button', { name: /create employee/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    expect(screen.getByText('Email taken')).toBeInTheDocument();
  });

  it('submits the exact payload for a valid create', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <EmployeeForm open onOpenChange={() => {}} onSubmit={onSubmit} managers={[]} isPending={false} errorMessage={null} />
    );
    await user.type(screen.getByLabelText(/name \*/i), 'Grace Hopper');
    await user.type(screen.getByLabelText(/email \*/i), 'grace@x.com');
    await user.click(screen.getByRole('button', { name: /create employee/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Grace Hopper',
        email: 'grace@x.com',
        status: 'active',
        managerId: null,
      })
    );
  });
});
