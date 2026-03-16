export interface Address {
  id: string;
  formattedAddress: string;
  addressLine: string;
  ward: string;
  district: string;
  city: string;
  province: string;
  country: string;
  latitude: number;
  longitude: number;
  placeId: string;
  addressType: string;
  fromDate: string;
  toDate: string;
  isPrimary: boolean;
  description: string;
}

/**
 * Person address request — includes isPrimary
 * Used for: POST/PUT /trees/{treeId}/persons/{personId}/addresses
 */
export interface AddressCreateRequest {
  formattedAddress: string;
  addressLine: string;
  ward: string;
  district: string;
  city: string;
  province: string;
  country: string;
  latitude: number;
  longitude: number;
  placeId: string;
  addressTypeId: string;
  fromDate: string;
  toDate: string;
  isPrimary: boolean;
  description: string;
}

/**
 * Tree address request — no isPrimary field
 * Used for: POST/PUT /trees/{treeId}/addresses
 */
export interface TreeAddressRequest {
  formattedAddress: string;
  addressLine: string;
  ward: string;
  district: string;
  city: string;
  province: string;
  country: string;
  latitude: number;
  longitude: number;
  placeId: string;
  addressTypeId: string;
  fromDate: string;
  toDate: string;
  description: string;
}
