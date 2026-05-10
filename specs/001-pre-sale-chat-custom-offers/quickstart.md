# Quickstart: Pre-sale Chat and Custom Offers

## Development Setup

1. **Database Migration**:
   - Add the `CustomOffer` entity to `ApplicationDbContext.cs`.
   - Update the `Message` entity to include `CustomOfferId`.
   - Run `dotnet ef migrations add AddCustomOffers`.
   - Run `dotnet ef database update`.

2. **Backend Implementation**:
   - Implement `CustomOffer` service methods in `DomainServices.cs`.
   - Add endpoints to `ChatController.cs` and `OrdersController.cs`.
   - Update `ChatHub.cs` to handle offer broadcasting.

3. **Frontend Implementation**:
   - Add "Contact" button to `msa3ed/UIS/app/student/service/[id].tsx`.
   - Create `OfferCard` component in `msa3ed/UIS/components`.
   - Update `chatSlice.ts` to handle custom offer messages.
   - Implement "Create Offer" modal for executors.

## Verification Steps

1. **Pre-sale Chat**:
   - Log in as Student -> Go to a Service -> Click "Contact".
   - Verify a private chat is opened.
2. **Send Offer**:
   - Log in as Executor -> Go to the chat -> Click "Create Offer".
   - Submit offer. Verify it appears in the chat for both users.
3. **Accept Offer**:
   - Log in as Student -> Click "Accept" on the offer card.
   - Verify redirection to payment/order details with custom price.
