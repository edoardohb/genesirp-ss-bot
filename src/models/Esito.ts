import mongoose, { Document, Schema } from 'mongoose';

interface IEsito extends Document {
  bypasser: string;
  pin: string;
  time: string;
  found: string;
  proofs: string;
  scanner: string;
  screenSharer: string;
  createdAt: Date;
}

const esitoSchema = new Schema<IEsito>({
  bypasser: { type: String, required: true },
  pin: { type: String, required: true },
  time: { type: String, required: true },
  found: { type: String, required: true },
  scanner: { type: String, required: true },
  proofs: { type: String, required: true },
  screenSharer: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Esito = mongoose.model<IEsito>('Esito', esitoSchema);

export default Esito;
