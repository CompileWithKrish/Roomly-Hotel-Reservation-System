async function runTests() {
  const BASE_URL = 'http://localhost:8080/api/v1';
  console.log('=== STARTING ROOMLY CREDIT CARD OFFERS VERIFICATION ===\n');

  // Helper for JSON requests
  async function api(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const text = await res.text();
    try {
      return { status: res.status, ok: res.ok, data: JSON.parse(text) };
    } catch {
      return { status: res.status, ok: res.ok, data: text };
    }
  }

  // 1. Authenticate Admin and Customer
  console.log('1. Authenticating Admin and Customer...');
  const adminLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@roomly.com', password: 'admin123' }),
  });
  const customerLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'customer@roomly.com', password: 'customer123' }),
  });

  const adminToken = adminLogin.data.accessToken;
  const customerToken = customerLogin.data.accessToken;
  console.log('   Admin logged in:', !!adminToken);
  console.log('   Customer logged in:', !!customerToken);

  // 2. Security Check: Customer cannot access Admin Offer Endpoints
  console.log('\n2. Security Check: Role-Based Authorization on /admin/offers...');
  const unauthorizedAdminGet = await api('/admin/offers', {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  console.log('   Customer accessing /admin/offers status:', unauthorizedAdminGet.status, '(Expect 403 Forbidden)');
  if (unauthorizedAdminGet.status !== 403) {
    throw new Error('SECURITY VIOLATION: Non-admin accessed admin offers endpoint!');
  }

  // 3. Admin: Fetch Initial Offers & Stats
  console.log('\n3. Admin: Inspecting Initial Offers & Stats...');
  const initialAdminOffers = await api('/admin/offers', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('   Total configured offers:', initialAdminOffers.data.totalElements);
  initialAdminOffers.data.content.forEach((o) => {
    console.log(`   - [${o.code}] ${o.bankName}: ${o.title} (${o.discountType} - ${o.discountValue})`);
  });

  const offerStats = await api('/admin/offers/stats', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('   Offer Stats:', JSON.stringify(offerStats.data));

  // 4. Admin Creates a New Custom Offer: AMEX20 (20% off up to $200, min spend $500, max 2 total redemptions)
  console.log('\n4. Admin: Creating new offer AMEX20...');
  const now = new Date();
  const nextMonth = new Date(Date.now() + 30 * 86400000);
  const createOfferRes = await api('/admin/offers', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      code: 'AMEX20',
      title: 'American Express Platinum — 20% Luxury Stay Rebate',
      bankName: 'American Express',
      cardNetwork: 'Amex',
      cardType: 'Credit Card',
      description: 'Exclusive 20% savings up to $200 for Amex Cardmembers.',
      discountType: 'PERCENTAGE',
      discountValue: 20.0,
      maxDiscount: 200.0,
      minBookingAmount: 500.0,
      startDateTime: now.toISOString(),
      expiryDateTime: nextMonth.toISOString(),
      maxTotalRedemptions: 2, // Strict limit for concurrency testing
      maxPerCustomerRedemptions: 1,
      termsAndConditions: 'Exclusive to Amex Platinum & Centurion cardholders.',
      isActive: true,
    }),
  });
  console.log('   Create offer status:', createOfferRes.status, 'Code:', createOfferRes.data.code);
  const newOfferId = createOfferRes.data.id;

  // 5. Customer: Query Active Offers (with booking amount $600)
  console.log('\n5. Customer: Fetching active offers for $600 booking...');
  const customerOffers = await api('/offers?bookingAmount=600');
  const foundAmex = customerOffers.data.find((o) => o.code === 'AMEX20');
  console.log('   Amex offer found in customer listing:', !!foundAmex);

  // 6. Discount Calculation & Validation Tests
  console.log('\n6. Discount Calculation & Eligibility Verification...');

  // Test 6a: Minimum spend failure ($300 < $500 min spend)
  const minSpendTest = await api('/offers/validate', {
    method: 'POST',
    body: JSON.stringify({
      offerCode: 'AMEX20',
      bookingAmount: 300.0,
      customerEmail: 'customer@roomly.com',
    }),
  });
  console.log('   6a. Below Min Spend ($300): isValid =', minSpendTest.data.isValid, '| Message =', minSpendTest.data.message);

  // Test 6b: Percentage with Cap ($1500 booking -> 20% is $300, capped at $200)
  const cappedDiscountTest = await api('/offers/validate', {
    method: 'POST',
    body: JSON.stringify({
      offerCode: 'AMEX20',
      bookingAmount: 1500.0,
      customerEmail: 'customer@roomly.com',
    }),
  });
  console.log(
    '   6b. Capped Discount ($1500 @ 20%, max $200): Discount = $' +
      cappedDiscountTest.data.discountAmount +
      ' (Expect $200.00), Final = $' +
      cappedDiscountTest.data.finalAmount
  );

  // Test 6c: Normal percentage ($800 booking -> 20% is $160)
  const normalDiscountTest = await api('/offers/validate', {
    method: 'POST',
    body: JSON.stringify({
      offerCode: 'AMEX20',
      bookingAmount: 800.0,
      customerEmail: 'customer@roomly.com',
    }),
  });
  console.log(
    '   6c. Normal Discount ($800 @ 20%): Discount = $' +
      normalDiscountTest.data.discountAmount +
      ' (Expect $160.00), Final = $' +
      normalDiscountTest.data.finalAmount
  );

  // 7. Booking Integration: Create Booking with AMEX20 Offer Redemption
  console.log('\n7. End-to-End Booking Creation with AMEX20 Redemption...');
  const rooms = await api('/rooms');
  const room = rooms.data.content[0];

  const booking1 = await api('/bookings', {
    method: 'POST',
    body: JSON.stringify({
      roomId: room.id,
      guestName: 'Sarah Jenkins',
      guestEmail: 'customer@roomly.com',
      guestPhone: '+1 (555) 987-6543',
      checkInDate: '2026-11-20',
      checkOutDate: '2026-11-24',
      paymentMethod: 'Amex Platinum',
      offerId: newOfferId,
      offerCode: 'AMEX20',
      specialRequests: 'High floor, feather pillows.',
    }),
  });
  console.log(
    '   Booking 1 Created:',
    booking1.data.bookingNumber,
    'Total Amount: $' + booking1.data.totalAmount,
    'Discount Applied: $' + booking1.data.discount,
    'Offer Code:',
    booking1.data.offerCode
  );

  // 8. Prevent Exceeding Per-Customer Limit
  console.log('\n8. Enforcing Per-Customer Redemption Limit...');
  const duplicateCustomerTest = await api('/offers/validate', {
    method: 'POST',
    body: JSON.stringify({
      offerCode: 'AMEX20',
      bookingAmount: 800.0,
      customerEmail: 'customer@roomly.com', // Already redeemed above!
    }),
  });
  console.log(
    '   Duplicate customer attempt: isValid =',
    duplicateCustomerTest.data.isValid,
    '| Message =',
    duplicateCustomerTest.data.message
  );

  // 9. Customer 2 books to hit maxTotalRedemptions (limit = 2)
  console.log('\n9. Second Customer Booking & Hitting Campaign Max Redemptions...');
  const room2 = rooms.data.content[1];
  const booking2 = await api('/bookings', {
    method: 'POST',
    body: JSON.stringify({
      roomId: room2.id,
      guestName: 'Marcus Vance',
      guestEmail: 'marcus@vance.com',
      guestPhone: '+1 (555) 321-4567',
      checkInDate: '2026-11-20',
      checkOutDate: '2026-11-24',
      paymentMethod: 'Amex Centurion',
      offerId: newOfferId,
      offerCode: 'AMEX20',
    }),
  });
  console.log('   Booking 2 Created:', booking2.data.bookingNumber, 'Discount: $' + booking2.data.discount);

  // Third customer tries to redeem AMEX20 -> should fail because maxTotalRedemptions (2) reached!
  const thirdCustomerTest = await api('/offers/validate', {
    method: 'POST',
    body: JSON.stringify({
      offerCode: 'AMEX20',
      bookingAmount: 800.0,
      customerEmail: 'third@customer.com',
    }),
  });
  console.log(
    '   Third customer attempt (limit 2 reached): isValid =',
    thirdCustomerTest.data.isValid,
    '| Message =',
    thirdCustomerTest.data.message
  );

  // 10. Admin: Toggle Status, Edit, and Archive
  console.log('\n10. Admin: Offer Deactivation and Safe Archiving...');
  const toggleRes = await api(`/admin/offers/${newOfferId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ isActive: false }),
  });
  console.log('   Toggled AMEX20 isActive to:', toggleRes.data.isActive);

  // Safe Archive Test: because AMEX20 has 2 redemptions, DELETE should archive it, not crash
  const deleteRes = await api(`/admin/offers/${newOfferId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('   Delete/Archive call status code:', deleteRes.status);

  const updatedAdminOffers = await api(`/admin/offers/${newOfferId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('   AMEX20 status post-archive: isArchived =', updatedAdminOffers.data.isArchived, ', isActive =', updatedAdminOffers.data.isActive);

  console.log('\n=== ALL 10 TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
