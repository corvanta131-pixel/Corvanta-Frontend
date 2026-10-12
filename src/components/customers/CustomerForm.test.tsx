import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CustomerForm, buildCustomerPayload, makeCustomerSchema } from './CustomerForm';

const base = { name: 'Ada Lovelace', email: 'ada@x.com', phone: '', status: 'active' as const, notes: '' };

describe('customer payloads and schema', () => {
  it('omits empty optionals on create and sends strings on update so fields can be cleared', () => {
    expect(buildCustomerPayload(base, false)).toEqual({ name: 'Ada Lovelace', status: 'active', email: 'ada@x.com' });
    expect(buildCustomerPayload(base, true)).toEqual({
      name: 'Ada Lovelace',
      status: 'active',
      email: 'ada@x.com',
      phone: '',
      notes: '',
    });
  });

  it('mirrors backend limits', () => {
    const create = makeCustomerSchema(false);
    const edit = makeCustomerSchema(true);
    expect(create.safeParse({ ...base, name: 'A' }).success).toBe(false);
    expect(create.safeParse({ ...base, name: 'A'.repeat(151) }).success).toBe(false);
    expect(create.safeParse({ ...base, email: '' }).success).toBe(false);
    expect(edit.safeParse({ ...base, email: '' }).success).toBe(true);
    expect(create.safeParse({ ...base, email: 'nope' }).success).toBe(false);
    expect(create.safeParse({ ...base, phone: '1' }).success).toBe(false);
    expect(create.safeParse({ ...base, phone: '1'.repeat(31) }).success).toBe(false);
    expect(create.safeParse({ ...base, notes: 'n'.repeat(2001) }).success).toBe(false);
    expect(create.safeParse({ ...base, status: 'bogus' }).success).toBe(false);
    expect(create.safeParse(base).success).toBe(true);
  });
});

describe('CustomerForm', () => {
  it('blocks invalid submissions with field errors', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<CustomerForm open onOpenChange={() => {}} onSubmit={onSubmit} isPending={false} errorMessage={null} />);
    await user.click(screen.getByRole('button', { name: /create customer/i }));
    expect(await screen.findByText('Name must be at least 2 characters')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the exact payload', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<CustomerForm open onOpenChange={() => {}} onSubmit={onSubmit} isPending={false} errorMessage={null} />);
    await user.type(screen.getByLabelText(/name \*/i), 'Grace Hopper');
    await user.type(screen.getByLabelText(/email \*/i), 'grace@x.com');
    await user.type(screen.getByLabelText(/phone/i), '+2348000000000');
    await user.selectOptions(screen.getByLabelText(/status/i), 'prospect');
    await user.click(screen.getByRole('button', { name: /create customer/i }));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Grace Hopper',
        status: 'prospect',
        email: 'grace@x.com',
        phone: '+2348000000000',
      })
    );
  });
});
