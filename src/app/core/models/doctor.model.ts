export interface DoctorResponse {
  id: number;
  name: string;
  speciality: string;
  schedule: { [key: string]: string };
  cabinetId: number;
  cabinetName: string;
}

export interface DoctorCreateRequest {
  name: string;
  speciality: string;
  schedule: { [key: string]: string };
  cabinetId: number;
}

export interface Cabinet {
  id: number;
  nom: string;
}
