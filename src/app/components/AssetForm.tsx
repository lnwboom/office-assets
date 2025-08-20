"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/Toast";

interface AssetFormProps {
  type: "new" | "edit";
  initialData?: {
    id: string;
    code: string;
    name: string;
    type: string;
    status: string;
    purchaseDate: string;
    description?: string;
  };
}

export default function AssetForm({ type, initialData }: AssetFormProps) {
  const [formData, setFormData] = useState({
    code: initialData?.code || "",
    name: initialData?.name || "",
    type: initialData?.type || "",
    status: initialData?.status || "AVAILABLE",
    purchaseDate: initialData?.purchaseDate
      ? new Date(initialData.purchaseDate).toISOString().split("T")[0]
      : "",
    description: initialData?.description || "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url =
        type === "new" ? "/api/assets" : `/api/assets/${initialData?.id}`;
      const method = type === "new" ? "POST" : "PUT";

      console.log("Submitting to URL:", url, "with method:", method);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          throw new Error(errorData.error || "Failed to save asset");
        } else {
          const errorText = await response.text();
          console.error("Non-JSON error response:", errorText);
          throw new Error("Unexpected server response");
        }
      }

      showToast.success(
        type === "new" ? "เพิ่มอุปกรณ์สำเร็จ" : "แก้ไขอุปกรณ์สำเร็จ",
        "ข้อมูลถูกบันทึกเรียบร้อยแล้ว"
      );
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Error during submission:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
      setError(errorMessage);
      showToast.error("เกิดข้อผิดพลาด", errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {type === "new" ? "เพิ่มอุปกรณ์ใหม่" : "แก้ไขข้อมูลอุปกรณ์"}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                กรุณากรอกข้อมูลอุปกรณ์ให้ครบถ้วน
              </p>
            </div>
          </div>

          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="code"
                      className="block text-sm font-medium text-gray-700"
                    >
                      รหัสอุปกรณ์
                    </label>
                    <input
                      type="text"
                      name="code"
                      id="code"
                      required
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      ชื่ออุปกรณ์
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="type"
                      className="block text-sm font-medium text-gray-700"
                    >
                      ประเภท
                    </label>
                    <input
                      type="text"
                      name="type"
                      id="type"
                      required
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      รายละเอียด
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="รายละเอียดเพิ่มเติมของอุปกรณ์..."
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700"
                    >
                      สถานะ
                    </label>
                    <select
                      id="status"
                      name="status"
                      required
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    >
                      <option value="AVAILABLE">พร้อมใช้งาน</option>
                      <option value="IN_USE">กำลังใช้งาน</option>
                      <option value="BROKEN">ชำรุด</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="purchaseDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      วันที่สั่งซื้อ
                    </label>
                    <input
                      type="date"
                      name="purchaseDate"
                      id="purchaseDate"
                      required
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={formData.purchaseDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          purchaseDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Preview
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                      <li>
                        <strong>รหัสอุปกรณ์:</strong> {formData.code}
                      </li>
                      <li>
                        <strong>ชื่ออุปกรณ์:</strong> {formData.name}
                      </li>
                      <li>
                        <strong>ประเภท:</strong> {formData.type}
                      </li>
                      <li>
                        <strong>รายละเอียด:</strong>{" "}
                        {formData.description || "-"}
                      </li>
                      <li>
                        <strong>สถานะ:</strong> {formData.status}
                      </li>
                      <li>
                        <strong>วันที่สั่งซื้อ:</strong> {formData.purchaseDate}
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <button
                    type="button"
                    className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => router.back()}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {type === "new" ? "เพิ่มอุปกรณ์" : "บันทึกการแก้ไข"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
