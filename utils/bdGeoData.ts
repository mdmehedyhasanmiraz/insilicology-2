import divisionsData from '@/data/bd-geo/bd-divisions.json';
import districtsData from '@/data/bd-geo/bd-districts.json';
import upazilasData from '@/data/bd-geo/bd-upazilas.json';

export interface Division {
  id: string;
  name: string;
  bn_name: string;
  lat: string;
  long: string;
}

export interface District {
  id: string;
  division_id: string;
  name: string;
  bn_name: string;
  lat: string;
  long: string;
}

export interface Upazila {
  id: string;
  district_id: string;
  name: string;
  bn_name: string;
}

// Get all divisions
export function getDivisions(): Division[] {
  return divisionsData.divisions;
}

// Get districts by division ID
export function getDistrictsByDivision(divisionId: string): District[] {
  return districtsData.districts.filter(district => district.division_id === divisionId);
}

// Get upazilas by district ID
export function getUpazilasByDistrict(districtId: string): Upazila[] {
  return upazilasData.upazilas.filter(upazila => upazila.district_id === districtId);
}

// Get division by ID
export function getDivisionById(divisionId: string): Division | undefined {
  return divisionsData.divisions.find(division => division.id === divisionId);
}

// Get district by ID
export function getDistrictById(districtId: string): District | undefined {
  return districtsData.districts.find(district => district.id === districtId);
}

// Get upazila by ID
export function getUpazilaById(upazilaId: string): Upazila | undefined {
  return upazilasData.upazilas.find(upazila => upazila.id === upazilaId);
} 