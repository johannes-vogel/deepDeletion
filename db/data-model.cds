namespace Data;

using { Country, managed, cuid}
  from '@sap/cds/common';


entity Shipper {
	key UUID				: UUID;
	Address1				: String(40);
	City					: String(40);
	Company					: String(40);
	CompanyId				: UUID;
	Contact					: String(40);
	Country					: String(2);
	Email					: String(60);
	Id						: String(40);
	Name					: String(255);
	Phone					: String(15);
	PostalCode				: String(10);
	StateProvince			: String(40);
	Symbol					: String(400);
	tenantID				: UUID;
	ToCarriers				: Composition of many Data.Carrier on ToCarriers.Shipper_UUID = $self.UUID;
}

entity Carrier {
	key UUID				: UUID;
	Shipper_UUID			: UUID;
	AdapterRegistrationId	: String(40);
	CompanyId				: UUID;
	Id						: String(40);
	Name					: String(255);
	Symbol					: String(400);
	tenantID				: UUID;
}
entity Service {
	key UUID				: UUID;
	Carrier_UUID			: UUID;
	Description 			: String(500);
	Name					: String(255);
	Symbol					: String(400);
	CarrierId				: String(40);
	tenantID				: UUID;
}