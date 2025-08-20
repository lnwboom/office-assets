import { notFound } from "next/navigation";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Asset from "@/models/Asset";
import AssetForm from "../../../components/AssetForm";

interface AssetDocument {
  _id: Types.ObjectId;
  code: string;
  name: string;
  type: string;
  status: string;
  purchaseDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export default async function EditAssetPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    await dbConnect();

    // Validate MongoDB ObjectId format
    if (!Types.ObjectId.isValid(params.id)) {
      notFound();
    }

    const asset = (await Asset.findById(
      params.id
    ).lean()) as AssetDocument | null;

    if (!asset) {
      notFound();
    }

    // Clean and transform the MongoDB document for the form
    const assetData = {
      id: asset._id.toString(),
      code: asset.code,
      name: asset.name,
      type: asset.type,
      status: asset.status,
      purchaseDate: asset.purchaseDate.toISOString().split("T")[0],
      description: asset.description || "",
    };

    return <AssetForm type="edit" initialData={assetData} />;
  } catch (error) {
    console.error("Error fetching asset:", error);
    notFound();
  }
}
