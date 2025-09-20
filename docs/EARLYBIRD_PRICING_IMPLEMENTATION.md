# Earlybird Pricing Implementation for Workshops

## Overview

This implementation adds earlybird pricing functionality to workshops, where the first N enrollments (based on `earlybirds_count`) get a discounted price (`price_earlybirds`). The system automatically checks the current enrollment count and applies the appropriate pricing.

## Database Schema

### Workshops Table
- `price_earlybirds` (numeric): Earlybird price for the workshop
- `earlybirds_count` (integer): Number of earlybird spots available

### User Workshops Table
- `user_id` (uuid): Reference to users table
- `workshop_id` (uuid): Reference to workshops table
- `created_at` (timestamp): When the enrollment was created

## Core Logic

### Pricing Priority (in order)
1. **Earlybird Price**: If enrollments < `earlybirds_count` AND `price_earlybirds` > 0
2. **Offer Price**: If `price_offer` > 0 (and earlybird not applicable)
3. **Regular Price**: Default fallback

### Earlybird Conditions
- `price_earlybirds` must be set and > 0
- `earlybirds_count` must be set and > 0
- Current enrollments must be < `earlybirds_count`

## Implementation Details

### 1. Utility Functions (`utils/workshopPricingUtils.ts`)

#### `getWorkshopPricing(workshopId: string)`
- Fetches workshop pricing details
- Counts current enrollments from `user_workshops` table
- Applies earlybird logic
- Returns comprehensive pricing information

#### `formatPrice(price: number)`
- Formats price in Bengali locale with ৳ symbol

#### `getPriceDisplayText(pricing: WorkshopPricing)`
- Generates display text with badges and descriptions
- Shows earlybird/offer indicators

### 2. Updated Components

#### WorkshopEnrollWrapper
- Fetches workshop pricing on load
- Passes pricing to enrollment forms

#### AcademicWorkshopEnrollForm
- Displays earlybird pricing information
- Shows remaining spots count
- Uses correct pricing for payment

#### WorkshopEnrollForm
- Displays earlybird pricing information
- Shows remaining spots count
- Uses correct pricing for payment

#### Workshop Payment Page
- Shows comprehensive pricing breakdown
- Displays earlybird badges and spot counts
- Uses correct pricing for bKash payment

### 3. Pricing Display Features

#### Visual Indicators
- 🎯 **Earlybird Badge**: Blue badge when earlybird pricing is active
- 💥 **Special Offer Badge**: Green badge for regular offer pricing
- **Spot Counter**: Shows remaining earlybird spots

#### Price Display
- **Current Price**: The price the user will pay
- **Original Price**: Strikethrough price when discounted
- **Savings**: Shows how much money is saved

## User Experience Flow

### 1. Workshop Display
- Users see current pricing with earlybird indicators
- Clear indication of how many spots are left
- Visual badges for different pricing types

### 2. Enrollment Process
- Pricing information is consistent across all forms
- Users know exactly what they'll pay
- Earlybird status is clearly communicated

### 3. Payment Processing
- Correct pricing is automatically applied
- No manual price calculation needed
- Consistent pricing across all payment flows

## Technical Implementation

### State Management
```typescript
const [workshopPricing, setWorkshopPricing] = useState<WorkshopPricing | null>(null);
```

### Data Fetching
```typescript
// Get workshop pricing with earlybird logic
const pricing = await getWorkshopPricing(workshopId);
setWorkshopPricing(pricing);
```

### Payment Calculation
```typescript
// Use earlybird pricing if available, otherwise fall back to regular logic
const amount = workshopPricing?.currentPrice || 
  Number(workshop.price_offer && workshop.price_offer > 0 ? workshop.price_offer : workshop.price_regular);
```

## Error Handling

### Fallback Scenarios
- If pricing fetch fails, falls back to regular pricing
- If enrollment count fails, assumes no earlybird spots left
- Graceful degradation when earlybird data is missing

### Logging
- Comprehensive error logging for debugging
- Non-blocking errors for better user experience
- Clear error messages for support team

## Testing Scenarios

### 1. Earlybird Active
- [ ] Workshop has earlybird pricing configured
- [ ] Current enrollments < earlybirds_count
- [ ] Earlybird price is displayed
- [ ] Spot counter shows remaining spots
- [ ] Payment uses earlybird price

### 2. Earlybird Expired
- [ ] Workshop has earlybird pricing configured
- [ ] Current enrollments >= earlybirds_count
- [ ] Regular/offer pricing is displayed
- [ ] No earlybird indicators shown
- [ ] Payment uses regular/offer price

### 3. No Earlybird
- [ ] Workshop has no earlybird pricing
- [ ] Regular pricing is displayed
- [ ] No earlybird indicators shown
- [ ] Payment uses regular/offer price

### 4. Edge Cases
- [ ] Workshop with 0 earlybird spots
- [ ] Workshop with 0 earlybird price
- [ ] Workshop with missing pricing data
- [ ] Network errors during pricing fetch

## Performance Considerations

### Database Queries
- Single query to get workshop details
- Single count query for enrollments
- Efficient indexing on `workshop_id` in `user_workshops`

### Caching
- Pricing data is fetched once per session
- No unnecessary re-fetches during form interactions
- Optimized for real-time enrollment updates

## Future Enhancements

### 1. Real-time Updates
- WebSocket integration for live enrollment counts
- Real-time pricing updates as spots fill

### 2. Advanced Pricing Rules
- Time-based earlybird pricing
- Tiered earlybird pricing (first 5, next 10, etc.)
- Dynamic pricing based on demand

### 3. Analytics
- Track earlybird conversion rates
- Monitor pricing effectiveness
- User behavior analysis

### 4. Admin Features
- Real-time enrollment monitoring
- Earlybird spot management
- Pricing strategy optimization tools

## Monitoring and Maintenance

### Key Metrics
- Earlybird spot utilization rate
- Pricing conversion rates
- User engagement with earlybird offers

### Common Issues
- Pricing not updating after enrollments
- Earlybird spots not counting correctly
- Payment amount mismatches

### Debugging Tools
- Console logging for pricing calculations
- Database query monitoring
- User session debugging information
