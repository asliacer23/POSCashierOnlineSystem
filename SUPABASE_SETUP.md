# 🧾 POS School Supplies System — Supabase Setup Guide

## 🚀 Tech Stack
Vite + React + TypeScript + TailwindCSS + shadcn/ui + Supabase

---

## ⚙️ Supabase Setup

### 1. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready (takes ~2 minutes)

### 2. Get Your Credentials
1. Go to Project Settings → API
2. Copy your **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
3. Copy your **Anon/Public Key**

### 3. Add Environment Variables
Create a `.env` file in the root of your project:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

**⚠️ Important:** Add `.env` to your `.gitignore` to keep credentials secure!

---

## 🗄️ Database Tables Setup

Go to your Supabase Dashboard → SQL Editor and run these queries:

### 1. Create App Role Enum
```sql
create type public.app_role as enum ('admin', 'cashier');
```

### 2. Create User Roles Table
```sql
create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (user_id, role)
);

alter table public.user_roles enable row level security;
```

### 3. Create Profiles Table
```sql
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    username text unique not null,
    email text unique not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;
```

### 4. Create Items Table
```sql
create table public.items (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    category text not null,
    price decimal(10,2) not null,
    stock integer not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.items enable row level security;
```

### 5. Create Orders Table
```sql
create table public.orders (
    id uuid primary key default gen_random_uuid(),
    cashier_id uuid references auth.users(id) on delete cascade not null,
    cashier_name text not null,
    items jsonb not null,
    total decimal(10,2) not null,
    payment_type text not null check (payment_type in ('CASH', 'GCASH')),
    amount_tendered decimal(10,2) not null,
    change decimal(10,2) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;
```

### 6. Create Security Definer Function for Role Checking
```sql
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;
```

### 7. Create Trigger for Auto-Creating Profiles
```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## 🔒 Row Level Security (RLS) Policies

### User Roles Policies
```sql
-- Admins can view all roles
create policy "Admins can view all roles"
on public.user_roles
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Admins can insert roles
create policy "Admins can insert roles"
on public.user_roles
for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

-- Admins can delete roles
create policy "Admins can delete roles"
on public.user_roles
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Users can view their own roles
create policy "Users can view own roles"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id);
```

### Profiles Policies
```sql
-- Admins can view all profiles
create policy "Admins can view all profiles"
on public.profiles
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Users can view their own profile
create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

-- Admins can update profiles
create policy "Admins can update profiles"
on public.profiles
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));
```

### Items Policies
```sql
-- Authenticated users can view items
create policy "Authenticated users can view items"
on public.items
for select
to authenticated
using (true);

-- Admins can insert items
create policy "Admins can insert items"
on public.items
for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

-- Admins can update items
create policy "Admins can update items"
on public.items
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Admins can delete items
create policy "Admins can delete items"
on public.items
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));
```

### Orders Policies
```sql
-- Cashiers and admins can view all orders
create policy "Cashiers and admins can view orders"
on public.orders
for select
to authenticated
using (
  public.has_role(auth.uid(), 'admin') or 
  public.has_role(auth.uid(), 'cashier')
);

-- Cashiers can insert their own orders
create policy "Cashiers can insert orders"
on public.orders
for insert
to authenticated
with check (
  auth.uid() = cashier_id and 
  public.has_role(auth.uid(), 'cashier')
);

-- Admins can insert orders
create policy "Admins can insert orders"
on public.orders
for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));
```

---

## 👤 Create Your First Admin User

### Option 1: Using Supabase Dashboard
1. Go to Authentication → Users
2. Click "Add User"
3. Enter email and password
4. Click "Create User"
5. Go to SQL Editor and run:

```sql
-- Replace 'USER_ID_HERE' with the actual user ID from the Users page
insert into public.user_roles (user_id, role)
values ('USER_ID_HERE', 'admin');
```

### Option 2: Using SQL (All at Once)
Run this in SQL Editor (replace email and password):

```sql
-- This will create a user and assign admin role
-- Note: You'll need to confirm the email manually in Auth → Users
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new
)
values (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com', -- Change this
  crypt('your_password', gen_salt('bf')), -- Change this
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"admin"}',
  now(),
  now(),
  '',
  '',
  ''
);

-- Get the user ID and insert admin role
insert into public.user_roles (user_id, role)
select id, 'admin'::app_role
from auth.users
where email = 'admin@example.com'; -- Same email as above
```

---

## 🧪 Testing the Setup

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Login with your admin credentials**

3. **Test admin features:**
   - Create a cashier account
   - Add items to inventory
   - View analytics

4. **Test cashier features:**
   - Login as cashier
   - Create orders
   - Process payments

---

## 📊 Sample Data (Optional)

Add sample items for testing:

```sql
insert into public.items (name, category, price, stock) values
('Notebook A4', 'Notebooks', 45.00, 100),
('Ballpen Black', 'Pens', 8.00, 200),
('Pencil HB', 'Pencils', 5.00, 150),
('Eraser White', 'Erasers', 10.00, 80),
('Ruler 30cm', 'Rulers', 15.00, 60),
('Scissors', 'Supplies', 35.00, 40),
('Glue Stick', 'Supplies', 25.00, 70),
('Colored Pencils Set', 'Art', 120.00, 30),
('Bond Paper (100s)', 'Paper', 85.00, 50),
('Folder Plastic', 'Organizers', 18.00, 90);
```

---

## 🔧 Troubleshooting

### "Invalid JWT" Error
- Check if your Supabase URL and Anon Key are correct in `.env`
- Restart your dev server after changing `.env`

### "Row Level Security Policy Violation"
- Make sure you've created all RLS policies
- Verify user has the correct role in `user_roles` table

### Can't Login
- Check Supabase Dashboard → Authentication → Users to verify user exists
- Verify email is confirmed (can manually confirm in dashboard)
- Check user has a role assigned in `user_roles` table

### Items Not Showing
- Verify items exist in database
- Check browser console for errors
- Verify RLS policies allow reading items

---

## 📱 Additional Features to Implement

- [ ] Email notifications for low stock
- [ ] Sales reports export (PDF/CSV)
- [ ] Barcode scanning
- [ ] Customer management
- [ ] Discount system
- [ ] Multi-store support
- [ ] Inventory transfer between stores

---

## 🚀 Deployment

1. Build your app:
   ```bash
   npm run build
   ```

2. Deploy to your favorite platform:
   - Vercel
   - Netlify
   - Firebase Hosting
   - Your own server

3. **Important:** Add environment variables in your hosting platform!

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [React Query](https://tanstack.com/query/latest)

---

**Built with ❤️ using Lovable.dev**
