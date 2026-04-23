export interface PlantPhoto {
  id: string;
  plantId: string;
  url: string;
  caption: string | null;
  takenAt: Date;
  uploadedBy: string;
  createdAt: Date;
}
