"use client";

import { useState } from "react";
import { uploadUsersFromExcel } from "../../actions/UploadUsers";

export default function AdminUploadPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    const formData = new FormData(event.currentTarget);
    const result = await uploadUsersFromExcel(formData);

    if (result.success) {
      setStatus(result.message || "Users imported successfully!");
    } else {
      setStatus(`Error: ${result.error}`);
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: "500px", margin: "40px auto" }}>
      <h2>Import Users from Excel</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" name="file" accept=".xlsx, .xls, .csv" required />
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Upload & Create Users"}
        </button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}