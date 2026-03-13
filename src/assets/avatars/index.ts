import daughterAvatar from "./Daughter.png";
import fatherAvatar from "./Father.png";
import grandFatherAvatar from "./GrandFather.png";
import grandMotherAvatar from "./GrandMother.png";
import homePageImage from "./HomePage.png";
import introduceImageAsset from "./Introduce.png";
import mapImageAsset from "./map.png";
import motherAvatar from "./Mother.png";
import sonAvatar from "./Son.png";
import cameraImageAsset from "./Camera.png";

export const introduceImage = introduceImageAsset;
export const mapImage = mapImageAsset;
export const homeImage = homePageImage;
export const cameraImage = cameraImageAsset;

interface GetPersonAvatarParams {
  gender?: string | null;
  avatarUrl?: string | null;
  birthday?: string | null;
  generation?: number | null;
}

const hasCustomAvatar = (avatarUrl?: string | null) =>
  typeof avatarUrl === "string" && avatarUrl.trim().length > 0;

export const getPersonAvatar = ({
  gender,
  avatarUrl,
  generation,
}: GetPersonAvatarParams): string => {
  if (hasCustomAvatar(avatarUrl)) {
    return avatarUrl!.trim();
  }

  if (generation !== null && generation !== undefined) {
    if (generation <= 1) {
      return gender === "F" ? grandMotherAvatar : grandFatherAvatar;
    }

    if (generation === 2) {
      return gender === "F" ? motherAvatar : fatherAvatar;
    }

    return gender === "F" ? daughterAvatar : sonAvatar;
  }

  return gender === "F" ? motherAvatar : fatherAvatar;
};
