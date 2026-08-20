-- Wipe demo/test marketplace rows. Keeps auth users and profiles.
-- Run once in Supabase SQL editor before inviting founders.

delete from public.hub_offers;
delete from public.hub_requests;
delete from public.hub_messages;

delete from public.bid_messages;
delete from public.bids;
delete from public.reviews;
delete from public.orders;
delete from public.interests;
delete from public.product_views;
delete from public.favorites;
delete from public.notifications;

-- All current listings were test/demo. Profiles and login accounts stay.
delete from public.products;
