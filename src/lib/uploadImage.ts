import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";
import { v4 as uuidv4 } from "uuid"; // Use built-in crypto or random if package is missing
// actually we'll just use a random string to avoid adding a uuid package

async function compressImage(file: File): Promise<File> {
  // Client-side compression using canvas to limit size to max 1200px width/height and good quality
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height *= maxDim / width));
            width = maxDim;
          } else {
            width = Math.round((width *= maxDim / height));
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file); // fallback

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file); // fallback
            resolve(new File([blob], file.name, { type: "image/webp" }));
          },
          "image/webp",
          0.85
        );
      };
      img.onerror = () => resolve(file); // fallback
    };
    reader.onerror = () => reject(new Error("Không thể đọc file."));
  });
}

export async function uploadImageToStorage(file: File): Promise<string> {
  if (!storage) throw new Error("Firebase Storage chưa được khởi tạo!");
  
  const compressedFile = await compressImage(file);
  const ext = compressedFile.type.split("/")[1] || "webp";
  const uniqueName = `questions/images/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
  
  const storageRef = ref(storage, uniqueName);
  await uploadBytes(storageRef, compressedFile);
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
}
