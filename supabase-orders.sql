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

create table if not exists public.meetup_proposals (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  proposed_by uuid not null references auth.users(id) on delete cascade,
  location text,
  meetup_date date,
  meetup_time time,
  buyer_accepted boolean not null default false,
  seller_accepted boolean not null default false,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meetup_proposals_status_check check (status in ('pending', 'confirmed', 'cancelled'))
);

alter table public.meetup_proposals enable row level security;

drop policy if exists "Order participants can view meetup proposals" on public.meetup_proposals;
drop policy if exists "Order participants can create meetup proposals" on public.meetup_proposals;
drop policy if exists "Order participants can update meetup proposals" on public.meetup_proposals;

create policy "Order participants can view meetup proposals"
  on public.meetup_proposals for select to authenticated
  using (exists (select 1 from public.orders where orders.id = order_id and (orders.buyer_id = auth.uid() or orders.seller_id = auth.uid())));

create policy "Order participants can create meetup proposals"
  on public.meetup_proposals for insert to authenticated
  with check (proposed_by = auth.uid() and exists (select 1 from public.orders where orders.id = order_id and (orders.buyer_id = auth.uid() or orders.seller_id = auth.uid())));

create policy "Order participants can update meetup proposals"
  on public.meetup_proposals for update to authenticated
  using (exists (select 1 from public.orders where orders.id = order_id and (orders.buyer_id = auth.uid() or orders.seller_id = auth.uid())))
  with check (exists (select 1 from public.orders where orders.id = order_id and (orders.buyer_id = auth.uid() or orders.seller_id = auth.uid())));

create index if not exists meetup_proposals_order_id_idx on public.meetup_proposals(order_id);

-- Read state for incoming chat notifications.
alter table public.messages add column if not exists read_at timestamptz;
drop policy if exists "Users can mark received messages as read" on public.messages;
create policy "Users can mark received messages as read"
  on public.messages for update to authenticated
  using (receiver_id = auth.uid())
  with check (receiver_id = auth.uid());

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

do $$
begin
  alter publication supabase_realtime add table public.meetup_proposals;
exception when duplicate_object then null;
end $$;