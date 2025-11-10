# POS School Supplies System

A complete Point of Sale (POS) system for school supplies built with React, TypeScript, TailwindCSS, shadcn/ui, and Supabase.

## 🚀 Features

### Admin Dashboard
- **Analytics**: View sales metrics, top-selling items, and revenue reports
- **Inventory Management**: Full CRUD operations for items with low stock alerts
- **Cashier Management**: Create and manage cashier accounts
- **Real-time Updates**: Live stock updates and sales tracking

### Cashier Dashboard
- **Order Management**: Add items to cart with quantity controls
- **Payment Processing**: Support for CASH and GCASH payments
- **Automatic Calculations**: Auto-calculate totals, change, and amount tendered
- **Order History**: View all completed transactions
- **Stock Validation**: Prevents over-ordering when stock is low

### General Features
- **Dark/Light Mode**: Theme toggle with localStorage persistence
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Role-Based Access**: Secure authentication with admin and cashier roles
- **Real-time Stock Updates**: Stock automatically decreases after each order

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js 16+ and npm
- A Supabase account (free tier works)
- Basic knowledge of React and TypeScript

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd <project-name>
npm install
```

### 2. Set Up Supabase

**See the complete setup guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**

The guide includes:
- Creating your Supabase project
- Setting up database tables
- Configuring Row Level Security (RLS)
- Creating your first admin user
- Sample data for testing

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📖 Usage Guide

### Admin Login

After setting up your admin user (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)), login with your credentials:

1. Navigate to `/login`
2. Enter your admin email and password
3. You'll be redirected to the admin dashboard

### Admin Features

**Dashboard**: View key metrics
- Total items in inventory
- Total orders and revenue
- Low stock alerts

**Inventory Management**: 
- Add new items with name, category, price, and stock
- Edit existing items
- Delete items
- Search and filter items
- Low stock warnings (< 10 units)

**Create Cashiers**:
- Add cashier accounts with email, password, and username
- View all cashiers
- Delete cashier accounts

**Analytics**:
- View total sales and average order value
- See top-selling items
- Monitor low stock alerts

### Cashier Features

**New Order**:
1. Search for items or filter by category
2. Click items to add to cart
3. Adjust quantities with +/- buttons
4. Click "Proceed to Checkout"
5. Select payment method (CASH or GCASH)
6. Enter amount tendered
7. System automatically calculates change
8. Click "Complete Order"

**Order History**:
- View all completed orders
- See order details, items, and payment information

## 🎨 Theme Customization

The app uses a black and white theme with dark/light mode support. Customize colors in:

- `src/index.css` - CSS custom properties
- `tailwind.config.ts` - Tailwind theme configuration

## 🔒 Security Features

- **Row Level Security (RLS)**: All database tables protected
- **Role-Based Access**: Admins and cashiers have different permissions
- **Secure Authentication**: Powered by Supabase Auth
- **Client-Side Route Protection**: Protected routes with role validation

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── AdminSidebar.tsx
│   ├── CashierSidebar.tsx
│   ├── DashboardLayout.tsx
│   ├── ProtectedRoute.tsx
│   └── ThemeToggle.tsx
├── contexts/            # React contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── lib/                 # Utility functions
│   ├── supabaseClient.ts
│   └── utils.ts
├── pages/               # Page components
│   ├── admin/
│   │   ├── Dashboard.tsx
│   │   ├── Inventory.tsx
│   │   ├── Analytics.tsx
│   │   └── Cashiers.tsx
│   ├── cashier/
│   │   ├── Dashboard.tsx
│   │   └── Orders.tsx
│   ├── Login.tsx
│   └── NotFound.tsx
└── App.tsx              # Main app component
```

## 🗄️ Database Schema

### Tables

- **profiles**: User profiles (username, email)
- **user_roles**: User role assignments (admin, cashier)
- **items**: Inventory items (name, category, price, stock)
- **orders**: Order records with items, payment details

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for complete schema and RLS policies.

## 🐛 Troubleshooting

### "Invalid JWT" Error
- Verify Supabase URL and Anon Key in `.env`
- Restart dev server after changing `.env`

### Can't See Data
- Check RLS policies are created
- Verify user has correct role in `user_roles` table

### Login Issues
- Confirm user exists in Supabase Auth → Users
- Check user has a role in `user_roles` table
- Verify email is confirmed

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel/Netlify

1. Push your code to GitHub
2. Connect your repo to Vercel/Netlify
3. Add environment variables in the hosting platform
4. Deploy!

**Important**: Add your production URL to Supabase:
- Authentication → URL Configuration
- Add your deployed URL as a redirect URL

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TailwindCSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 💡 Future Enhancements

- [ ] Receipt printing
- [ ] Barcode scanning
- [ ] Customer management
- [ ] Discount system
- [ ] Sales reports export (PDF/CSV)
- [ ] Email notifications for low stock
- [ ] Multi-store support
- [ ] Inventory transfer

---

**Built with ❤️ using Lovable.dev**
