import mongoose, { Document, Schema } from "mongoose";

export interface IService {
  name: string;
  description: string;
  icon?: string;
}

export interface IServiceCategory {
  category: string;
  services: IService[];
}

export interface ITeamMember {
  name: string;
  role: string;
  bio: string;
  image?: string;
  specialty?: string;
  education?: string;
}

export interface IDetails extends Document {
  services: IServiceCategory[];
  team: ITeamMember[];
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String },
  }
);

const serviceCategorySchema = new Schema<IServiceCategory>(
  {
    category: { type: String, required: true },
    services: [serviceSchema],
  }
);

const teamMemberSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    bio: { type: String, required: true },
    image: { type: String },
    specialty: { type: String },
    education: { type: String },
  }
);

const detailsSchema = new Schema<IDetails>(
  {
    services: [serviceCategorySchema],
    team: [teamMemberSchema],
  },
  { timestamps: true }
);

const Details = mongoose.models.Details || mongoose.model<IDetails>("Details", detailsSchema);

export default Details;