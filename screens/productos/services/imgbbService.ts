import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

export async function uploadImageToImgbb(imageUri: string): Promise<string> {
  const apiKey =
    process.env.EXPO_PUBLIC_IMGBB_API_KEY || "51c92e245d10de1eaa8307321d3fe361";

  if (!apiKey) {
    throw new Error("Falta EXPO_PUBLIC_IMGBB_API_KEY");
  }

  const formData = new FormData();

  if (Platform.OS === "web") {
    const imageResponse = await fetch(imageUri);
    const blob = await imageResponse.blob();

    formData.append("image", blob, "producto.jpg");
  } else {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    formData.append("image", base64);
  }

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });

  const json = await res.json();

  console.log("RESPUESTA IMGBB:", json);

  if (!res.ok || !json?.data?.url) {
    throw new Error(
      json?.error?.message || "No se pudo subir la imagen a ImgBB"
    );
  }

  return json.data.url;
}