-- Supabase SQL Schema for LuxeEssentials

-- Enable extensions
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text,
  last_name text,
  role text check(role in ('admin', 'customer')) default 'customer',
  push_tokens text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PRODUCTS TABLE
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price numeric(10, 2) not null,
  category text,
  stock_quantity integer default 0 not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ORDERS TABLE
create table orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete set null,
  status text check(status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled')) default 'pending',
  total_amount numeric(10, 2) not null,
  invoice_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ORDER_ITEMS TABLE
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) on delete restrict not null,
  quantity integer not null,
  unit_price numeric(10, 2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. QR_CODES TABLE
create table qr_codes (
  id uuid default uuid_generate_v4() primary key,
  target_url text not null,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. LOGS TABLE
create table logs (
  id uuid default uuid_generate_v4() primary key,
  entity_type text,
  entity_id uuid,
  action text,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. NOTIFICATIONS TABLE
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  body text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TRIGGERS & FUNCTIONS

-- Trigger to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on profiles for each row execute procedure update_updated_at_column();
create trigger update_products_updated_at before update on products for each row execute procedure update_updated_at_column();
create trigger update_orders_updated_at before update on orders for each row execute procedure update_updated_at_column();

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, role)
  values (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', 'customer');
  return new;
end;
$$ language plpgsql security definer;

create trigger sync_profile_on_auth_user_created
  after insert on auth.users for each row execute procedure public.handle_new_user();

-- Helper function: generate invoice number
create or replace function generer_numero_facture(order_id uuid)
returns text as $$
declare
  inv_number text;
begin
  inv_number := 'INV-' || substring(order_id::text from 1 for 8) || '-' || extract(epoch from now())::int;
  return inv_number;
end;
$$ language plpgsql;

-- Function: validate order (Transaction logic)
create or replace function valider_commande(p_order_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_item record;
begin
  -- Update stock
  for v_item in select product_id, quantity from order_items where order_id = p_order_id loop
    update products set stock_quantity = stock_quantity - v_item.quantity where id = v_item.product_id;
  end loop;
  
  -- Update order status
  update orders set status = 'paid', updated_at = now() where id = p_order_id;
  
  -- Insert log
  insert into logs (entity_type, entity_id, action, details)
  values ('order', p_order_id, 'validated', jsonb_build_object('timestamp', now()));
end;
$$;

-- RLS POLICIES
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

alter table products enable row level security;
create policy "Products are viewable by everyone." on products for select using (true);
create policy "Only admins can insert products." on products for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Only admins can update products." on products for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

alter table orders enable row level security;
create policy "Users can view their own orders." on orders for select using (auth.uid() = user_id or exists(select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Users can insert their own orders." on orders for insert with check (auth.uid() = user_id);
create policy "Admins can update orders." on orders for update using (exists(select 1 from profiles where id = auth.uid() and role = 'admin'));

alter table order_items enable row level security;
create policy "Users can view their own order items." on order_items for select using (
  exists (select 1 from orders where orders.id = order_items.order_id and (orders.user_id = auth.uid() or exists(select 1 from profiles where id = auth.uid() and role = 'admin')))
);
create policy "Users can insert their own order items." on order_items for insert with check (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);

alter table qr_codes enable row level security;
create policy "QR codes are viewable by everyone." on qr_codes for select using (true);
create policy "Admins can insert QR codes." on qr_codes for insert with check (exists(select 1 from profiles where id = auth.uid() and role = 'admin'));

alter table logs enable row level security;
create policy "Admins can view logs." on logs for select using (exists(select 1 from profiles where id = auth.uid() and role = 'admin'));

alter table notifications enable row level security;
create policy "Users can view their own notifications." on notifications for select using (auth.uid() = user_id);
create policy "Admins can insert notifications." on notifications for insert with check (exists(select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Users can update their notifications (to mark as read)." on notifications for update using (auth.uid() = user_id);

-- STORAGE: product image uploads
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public product images are viewable"
on storage.objects for select
using (bucket_id = 'product-images');

create policy "Admins can upload product images"
on storage.objects for insert
with check (
  bucket_id = 'product-images'
  and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

create policy "Admins can update product images"
on storage.objects for update
using (
  bucket_id = 'product-images'
  and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
)
with check (
  bucket_id = 'product-images'
  and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

create policy "Admins can delete product images"
on storage.objects for delete
using (
  bucket_id = 'product-images'
  and exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin')
);

-- NOTE: Execute this script in the Supabase SQL editor.
