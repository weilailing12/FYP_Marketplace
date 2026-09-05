-- Run this once in the Supabase SQL editor.
alter table public.products
  add column if not exists availability text not null default 'available';

alter table public.products
  drop constraint if exists products_availability_check;

alter table public.products
  add constraint products_availability_check
  check (availability in ('available', 'reserved', 'sold'));

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  buyer_id uuid not null references auth.users(id) on delete restrict,
  seller_id uuid not null references auth.users(id) on delete restrict,
  price numeric not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_status_check check (status in ('pending', 'accepted', 'rejected', 'completed', 'cancelled'))
);

alter table public.orders enable row level security;

drop policy if exists "Buyers and sellers can view their orders" on public.orders;
drop policy if exists "Buyers can place orders" on public.orders;
drop policy if exists "Sellers can update their orders" on public.orders;

create policy "Buyers and sellers can view their orders"
  on public.orders for select to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid());

create policy "Buyers can place orders"
  on public.orders for insert to authenticated
  with check (buyer_id = auth.uid());

create policy "Sellers can update their orders"
  on public.orders for update to authenticated
  using (seller_id = auth.uid())
  with check (seller_id = auth.uid());

create index if not exists orders_buyer_id_idx on public.orders(buyer_id);
create index if not exists orders_seller_id_idx on public.orders(seller_id);
create index if not exists orders_product_id_idx on public.orders(product_id);

-- Messages: only the sender and receiver can read or send a message.
alter table public.messages enable row level security;

drop policy if exists "Users can view their messages" on public.messages;
drop policy if exists "Users can send messages" on public.messages;

create policy "Users can view their messages"
  on public.messages for select to authenticated
  using (sender_id = auth.uid() or receiver_id = auth.uid());

create policy "Users can send messages"
  on public.messages for insert to authenticated
  with check (sender_id = auth.uid());

do $$
begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null;
end $$;