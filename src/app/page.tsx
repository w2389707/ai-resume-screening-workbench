import { UploadDropzone } from "@/components/workbench/upload-dropzone";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "48px 24px",
        background:
          "radial-gradient(circle at top, rgba(246, 195, 89, 0.24), transparent 38%), linear-gradient(180deg, #f8f5ec 0%, #f3efe4 100%)"
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <header style={{ marginBottom: 32 }}>
          <p style={{ margin: 0, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            AI Resume Screening
          </p>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", lineHeight: 1.02, margin: "12px 0" }}>
            AI Resume Screening Workbench
          </h1>
          <p style={{ maxWidth: 640, fontSize: "1.05rem", lineHeight: 1.6 }}>
            Upload a batch of PDF or .docx resumes to extract AI-related evidence.
          </p>
        </header>

        <UploadDropzone />
      </div>
    </main>
  );
}
