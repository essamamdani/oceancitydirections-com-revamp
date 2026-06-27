"use client";
import React, { useState, useRef } from "react";
import toast from "react-hot-toast";

const VideoUploadModal = ({ isOpen, onClose, business, onSuccess }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnails, setThumbnails] = useState([]);
  const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState(0);
  const [customThumbnail, setCustomThumbnail] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoPreview, setVideoPreview] = useState(null);
  const [title, setTitle] = useState(business?.title || "");
  const [description, setDescription] = useState(business?.description || "");
  const [location, setLocation] = useState(
    business?.address || `${business?.city || ""}, ${business?.state || ""}`
  );
  const [movWarning, setMovWarning] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const fileInputRef = useRef(null);
  const thumbInputRef = useRef(null);

  if (!isOpen || !business) return null;

  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  const isMovFile = (file) => {
    return file.name.toLowerCase().endsWith('.mov') || file.type === 'video/quicktime';
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file");
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > MAX_FILE_SIZE) {
      setSizeError(true);
      toast.error("Video file must be less than 100MB");
    } else {
      setSizeError(false);
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setMovWarning(isMovFile(file));
    setThumbnailError(false);
    setCustomThumbnail(null);
    setThumbnails([]);
    setSelectedThumbnailIndex(0);

    // Generate thumbnails (best effort — .mov may fail, backend will generate)
    toast.loading("Generating thumbnails...", { id: "thumb-gen" });
    try {
      const generatedThumbs = await generateThumbnails(file);
      if (generatedThumbs.length === 0) {
        setThumbnailError(true);
        toast("Could not auto-generate thumbnails. They will be generated on the server after upload.", {
          id: "thumb-gen",
          icon: "⚠️",
        });
      } else {
        setThumbnails(generatedThumbs);
        toast.success("Thumbnails generated!", { id: "thumb-gen" });
      }
    } catch (err) {
      console.error("Thumbnail generation failed:", err);
      setThumbnailError(true);
      toast("Could not auto-generate thumbnails. They will be generated on the server after upload.", {
        id: "thumb-gen",
        icon: "⚠️",
      });
    }
  };

  const generateThumbnails = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const generatedThumbs = [];

      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        // Generate thumbnails at 4 time points
        const times = [
          1,
          video.duration * 0.25,
          video.duration * 0.5,
          video.duration * 0.75,
        ].filter((t) => !isNaN(t) && t > 0);

        let currentIndex = 0;

        video.onseeked = () => {
          const scale = Math.min(1, 640 / video.videoWidth);
          canvas.width = video.videoWidth * scale;
          canvas.height = video.videoHeight * scale;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          generatedThumbs.push(canvas.toDataURL("image/jpeg", 0.85));

          currentIndex++;
          if (currentIndex < times.length) {
            video.currentTime = times[currentIndex];
          } else {
            URL.revokeObjectURL(video.src);
            resolve(generatedThumbs);
          }
        };

        video.currentTime = times[0];
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        // Graceful fallback: resolve with empty array instead of rejecting
        resolve([]);
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleThumbnailSelect = (idx) => {
    setSelectedThumbnailIndex(idx);
    setCustomThumbnail(null);
  };

  const handleCustomThumbnailSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Thumbnail must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCustomThumbnail(reader.result);
      setSelectedThumbnailIndex(-1);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!videoFile) {
      toast.error("Please select a video file");
      return;
    }

    if (videoFile.size > MAX_FILE_SIZE) {
      toast.error("Video file must be less than 100MB");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("video", videoFile);

      // Send only selected thumbnail (auto or custom)
      const thumbsToSend = [];
      if (customThumbnail) {
        thumbsToSend.push(customThumbnail);
      } else if (thumbnails.length > 0 && selectedThumbnailIndex >= 0) {
        thumbsToSend.push(thumbnails[selectedThumbnailIndex]);
      }
      formData.append("thumbnails", JSON.stringify(thumbsToSend));

      formData.append(
        "businessData",
        JSON.stringify({
          title: title || business.title || "Untitled",
          description: description || business.description || "",
          address: location || business.address || "",
          slug: business.slug || "",
          stateCode: business.state?.toLowerCase() || "md",
          siteUrl: typeof window !== "undefined" ? window.location.origin : "",
          categoryId: business.category_id || "1",
        })
      );

      const token = localStorage.getItem('auth-token') || '';

      // Use XMLHttpRequest for real progress tracking
      const xhr = new XMLHttpRequest();

      await new Promise((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            let errMsg = "Upload failed";
            try {
              const resp = JSON.parse(xhr.responseText);
              errMsg = resp.error || resp.details || errMsg;
            } catch (e) {}
            reject(new Error(errMsg));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
        xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

        xhr.open("POST", "/api/video/upload");
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.send(formData);
      });

      const data = JSON.parse(xhr.responseText);

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success("Video uploaded! Pending admin approval.");
      if (onSuccess) {
        onSuccess({
          videoId: data.videoId,
          videoUrl: data.videoUrl,
          thumbnail: data.thumbnail,
        });
      }
      handleClose();
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload video");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setThumbnails([]);
    setSelectedThumbnailIndex(0);
    setCustomThumbnail(null);
    setVideoPreview(null);
    setMovWarning(false);
    setThumbnailError(false);
    setSizeError(false);
    setUploading(false);
    setUploadProgress(0);
    onClose();
  };

  const handleRemoveFile = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setThumbnails([]);
    setSelectedThumbnailIndex(0);
    setCustomThumbnail(null);
    setVideoPreview(null);
    setMovWarning(false);
    setThumbnailError(false);
    setSizeError(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getThumbnailBorder = (idx) => {
    if (customThumbnail) return "2px solid transparent";
    return idx === selectedThumbnailIndex ? "2px solid #0d6efd" : "2px solid transparent";
  };

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "1rem" }}>
          {/* Header */}
          <div className="modal-header border-bottom-0 pb-0">
            <div>
              <h5 className="modal-title fw-bold">Upload Video</h5>
              <p className="text-muted small mb-0">
                For: <strong>{business.title}</strong>
              </p>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={uploading}
            ></button>
          </div>

          <div className="modal-body">
            {/* Courtesy Badge */}
            <div className="alert alert-light border d-flex align-items-center gap-2 py-2 mb-3">
              <i className="bx bx-video text-primary"></i>
              <span className="small">
                <strong>Courtesy:</strong>{" "}
                <a
                  href="https://www.videohomes.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-decoration-none"
                >
                  VideoHomes.com
                </a>
              </span>
            </div>

            {/* Size Error Alert */}
            {sizeError && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
                <i className="bx bx-error-circle fs-5"></i>
                <span className="small">
                  <strong>File too large:</strong> Maximum upload size is <strong>100MB</strong>. Please compress your video or upload a smaller file.
                </span>
              </div>
            )}

            {/* MOV Warning */}
            {movWarning && (
              <div className="alert alert-warning d-flex align-items-center gap-2 py-2 mb-3">
                <i className="bx bx-error-circle"></i>
                <span className="small">
                  <strong>.mov file detected:</strong> Browser can't auto-generate thumbnails for this format, but they will be generated on the server after upload. You can also upload a custom thumbnail below.
                </span>
              </div>
            )}

            {/* Video File Input */}
            {!videoFile ? (
              <div
                className="border-2 border-dashed rounded-4 p-5 text-center cursor-pointer"
                style={{ borderColor: "#dee2e6", background: "#f8f9fa" }}
                onClick={() => fileInputRef.current?.click()}
              >
                <i className="bx bx-cloud-upload text-muted" style={{ fontSize: "3rem" }}></i>
                <p className="mt-2 text-muted">
                  Click to select a video file
                  <br />
                  <span className="small">MP4, MOV, WebM (Max 100MB)</span>
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  className="d-none"
                  onChange={handleFileSelect}
                />
              </div>
            ) : (
              <div className="position-relative">
                {/* Video Preview */}
                {videoPreview && (
                  <video
                    src={videoPreview}
                    poster={customThumbnail || thumbnails[selectedThumbnailIndex] || undefined}
                    className="w-100 rounded-3 mb-3"
                    style={{ maxHeight: "250px", objectFit: "cover" }}
                    controls
                  />
                )}

                {/* File info */}
                <div className="d-flex justify-content-between align-items-center bg-light rounded-3 p-3">
                  <div className="d-flex align-items-center gap-2 overflow-hidden">
                    <i className="bx bx-movie text-primary fs-5"></i>
                    <div className="small overflow-hidden">
                      <div className="text-truncate">{videoFile.name}</div>
                      <div className={videoFile.size > MAX_FILE_SIZE ? "text-danger fw-bold" : "text-muted"}>
                        Size: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                        {videoFile.size > MAX_FILE_SIZE && " (Exceeds 100MB limit)"}
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={handleRemoveFile}
                    disabled={uploading}
                  >
                    <i className="bx bx-trash"></i>
                  </button>
                </div>

                {/* Thumbnails Section - VideoHomes Style Grid */}
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="small text-muted fw-semibold">Select Thumbnail</label>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => thumbInputRef.current?.click()}
                      disabled={uploading}
                    >
                      <i className="bx bx-upload me-1"></i>
                      Custom
                    </button>
                  </div>

                  <input
                    ref={thumbInputRef}
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={handleCustomThumbnailSelect}
                  />

                  {/* Auto-generated thumbnails grid */}
                  {thumbnails.length > 0 && (
                    <div className="row g-2 mb-2">
                      {thumbnails.map((thumb, idx) => (
                        <div key={idx} className="col-3 col-sm-2">
                          <div
                            className={`position-relative rounded-2 overflow-hidden cursor-pointer transition-all ${
                              !customThumbnail && idx === selectedThumbnailIndex
                                ? 'border border-2 border-primary shadow-sm'
                                : 'border border-2 border-transparent opacity-75 hover:opacity-100'
                            }`}
                            onClick={() => handleThumbnailSelect(idx)}
                            style={{ aspectRatio: '16/9' }}
                          >
                            <img
                              src={thumb}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-100 h-100"
                              style={{ objectFit: "cover" }}
                            />
                            {!customThumbnail && idx === selectedThumbnailIndex && (
                              <div className="position-absolute top-0 end-0 bg-primary text-white rounded-circle p-1 m-1" style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <i className="bx bx-check" style={{ fontSize: 12 }}></i>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Custom thumbnail preview */}
                  {customThumbnail && (
                    <div className="row g-2 mb-2">
                      <div className="col-3 col-sm-2">
                        <div
                          className="position-relative rounded-2 overflow-hidden border border-2 border-primary shadow-sm"
                          style={{ aspectRatio: '16/9' }}
                        >
                          <img
                            src={customThumbnail}
                            alt="Custom thumbnail"
                            className="w-100 h-100"
                            style={{ objectFit: "cover" }}
                          />
                          <div className="position-absolute top-0 end-0 bg-primary text-white rounded-circle p-1 m-1" style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="bx bx-check" style={{ fontSize: 12 }}></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* No thumbnails message */}
                  {thumbnails.length === 0 && !customThumbnail && (
                    <div className="text-muted small p-2 bg-light rounded">
                      {thumbnailError
                        ? "Auto-generation failed. Server will generate thumbnails after upload. You can also upload a custom thumbnail above."
                        : "No thumbnails generated yet."}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Auto-filled Fields */}
            <div className="mt-3">
              <div className="mb-2">
                <label className="small text-muted">Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Video title"
                />
              </div>
              <div className="mb-2">
                <label className="small text-muted">Description</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Video description"
                />
              </div>
              <div className="mb-2">
                <label className="small text-muted">Location</label>
                <input
                  type="text"
                  className="form-control"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Business location"
                />
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="mt-3">
                <div className="d-flex justify-content-between small mb-1">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="progress" style={{ height: "8px" }}>
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated"
                    role="progressbar"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer border-top-0 pt-0">
            <button
              type="button"
              className="btn btn-light"
              onClick={handleClose}
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={!videoFile || videoFile.size > MAX_FILE_SIZE || uploading}
            >
              {uploading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Uploading...
                </>
              ) : (
                <>
                  <i className="bx bx-upload me-1"></i>
                  Upload Video
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoUploadModal;
