# Canny Carrot Admin App

Comprehensive admin application for managing all businesses and customers in the Canny Carrot platform.

## Features

### Business Management
- **Full CRUD Operations**: Create, read, update, and delete businesses
- **Complete Lifecycle Management**:
  - Create new businesses
  - Onboard pending businesses
  - Edit all business fields
  - Manage day-to-day operations
  - Process renewals
  - Suspend businesses
  - Unsubscribe businesses
  - Close accounts
  - Delete businesses

- **All Business Fields**:
  - Basic information (name, contact, email, phone)
  - Address details
  - Business type and category
  - Company number and team size
  - Online presence (website, social media)
  - Subscription tier (Bronze, Silver, Gold)
  - Status management
  - CRM integration settings
  - Notification preferences
  - Notes and admin comments

### Customer Management
- **Full CRUD Operations**: Create, read, update, and delete customers
- **Complete Lifecycle Management**:
  - Create new customers
  - Onboard pending customers
  - Edit all customer fields
  - Manage day-to-day operations
  - Process renewals
  - Suspend customers
  - Unsubscribe customers
  - Close accounts
  - Delete customers

- **All Customer Fields**:
  - Basic information (name, email, phone, date of birth, postcode)
  - Marketing preferences (notifications, email, SMS)
  - Favourite categories
  - Preferred businesses
  - Referral codes
  - Status management
  - Statistics (scans, rewards, campaigns)
  - Notes and admin comments

### Responsive Design
- **Mobile Optimized**: Works seamlessly on smartphones
- **Tablet Support**: Optimized layout for tablets
- **Desktop Support**: Full-featured desktop experience
- **Adaptive Layouts**: Automatically adjusts based on screen size

## Getting Started

### Installation

```bash
cd canny-carrot-admin-app
npm install
```

### Running the App

#### Web (Desktop/Mobile Browser)
```bash
npm run web
```

#### iOS
```bash
npm run ios
```

#### Android
```bash
npm run android
```

#### Development Server
```bash
npm start
```

## Architecture

### Data Access Layer
- `src/services/dataAccess.ts`: Handles all CRUD operations
- **Production**: All data stored in Redis database (single source of truth)
- `src/services/redis.ts`: Redis client using Canny Carrot API as proxy
- All operations commit directly to Redis via API (`/api/v1/redis`)

### Components
- `BusinessForm.tsx`: Comprehensive business creation/editing form
- `CustomerForm.tsx`: Comprehensive customer creation/editing form
- `AdminBusinessesPage.tsx`: Business management interface
- `AdminCustomersPage.tsx`: Customer management interface

### Types
- `src/types/index.ts`: Complete type definitions for businesses and customers

### Responsive Utilities
- `src/utils/responsive.ts`: Responsive design helpers

## Lifecycle Actions

### Business Lifecycle
1. **Create**: New business registration
2. **Onboard**: Activate pending business
3. **Edit**: Update any business field
4. **Renew**: Process subscription renewal
5. **Suspend**: Temporarily suspend business
6. **Unsubscribe**: Business requests to leave
7. **Close**: Permanently close business account
8. **Delete**: Remove business from system

### Customer Lifecycle
1. **Create**: New customer registration
2. **Onboard**: Activate pending customer
3. **Edit**: Update any customer field
4. **Renew**: Process customer renewal
5. **Suspend**: Temporarily suspend customer
6. **Unsubscribe**: Customer requests to leave
7. **Close**: Permanently close customer account
8. **Delete**: Remove customer from system

## Status Types

### Business Status
- `pending`: Awaiting onboarding
- `active`: Fully operational
- `renewal_due`: Subscription renewal required
- `suspended`: Temporarily suspended
- `closed`: Account closed
- `exiting`: In process of leaving

### Customer Status
- `pending`: Awaiting onboarding
- `active`: Fully active
- `renewal_due`: Renewal required
- `suspended`: Temporarily suspended
- `closed`: Account closed
- `exiting`: In process of leaving

## Future Enhancements

- Redis integration for production data storage
- API integration for backend services
- Advanced filtering and search
- Bulk operations
- Export functionality
- Analytics dashboard
- Audit logging
- Role-based access control

