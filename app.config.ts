const { version } = require("./package.json");

const EAS_PROJECT_ID = "5032ecea-f4e9-4131-b37c-7c7bef0d689c";
const PROJECT_SLUG = "tomo";
const OWNER = "diamondrarktvo";

const APP_NAME = "ToMo";
const BUNDLE_IDENTIFIER = "com.tomo.app";
const PACKAGE_NAME = "com.tomo.app";
const ICON = "./assets/images/icon.png";
const IMAGES = "./assets/images";

const environment = process.env.EXPO_PUBLIC_APP_ENV || "development";

export const getDynamicAppConfig = (env: string) => {
  if (env === "production") {
    return {
      name: APP_NAME,
      bundleIdentifier: BUNDLE_IDENTIFIER,
      packageName: PACKAGE_NAME,
      icon: ICON,
    };
  }
  if (env === "preview") {
    return {
      name: `${APP_NAME} Preview`,
      bundleIdentifier: `${BUNDLE_IDENTIFIER}.preview`,
      packageName: `${PACKAGE_NAME}.preview`,
      icon: ICON,
    };
  }
  return {
    name: `${APP_NAME} Dev`,
    bundleIdentifier: `${BUNDLE_IDENTIFIER}.development`,
    packageName: `${PACKAGE_NAME}.development`,
    icon: ICON,
  };
};

export default ({ config }: { config: any }) => {
  const { name, bundleIdentifier, packageName, icon } =
    getDynamicAppConfig(environment);

  return {
    ...config,
    expo: {
      name,
      slug: PROJECT_SLUG,
      version,
      orientation: "portrait",
      icon,
      userInterfaceStyle: "dark",
      assetBundlePatterns: ["**/*"],
      ...(EAS_PROJECT_ID ? { extra: { eas: { projectId: EAS_PROJECT_ID } } } : {}),
      ...(OWNER ? { owner: OWNER } : {}),
      ios: {
        supportsTablet: true,
        bundleIdentifier,
        icon: {
          light: icon,
          dark: `${IMAGES}/ios-dark.png`,
          tinted: `${IMAGES}/ios-tinted.png`,
        },
      },
      android: {
        icon,
        adaptiveIcon: {
          foregroundImage: `${IMAGES}/android-icon-foreground.png`,
          backgroundImage: `${IMAGES}/android-icon-background.png`,
          monochromeImage: `${IMAGES}/android-icon-monochrome.png`,
          backgroundColor: "#0F1012",
        },
        predictiveBackGestureEnabled: false,
        package: packageName,
      },
      web: {
        favicon: `${IMAGES}/favicon.png`,
      },
      plugins: [
        "expo-font",
        "@react-native-community/datetimepicker",
        "expo-sharing",
        [
          "expo-image-picker",
          {
            photosPermission: "ToMo a besoin d'accéder à tes photos pour choisir l'image de ton véhicule.",
            cameraPermission: "ToMo a besoin de l'appareil photo pour prendre une photo de ton véhicule.",
          },
        ],
        [
          "expo-splash-screen",
          {
            image: `${IMAGES}/splash-icon.png`,
            imageWidth: 340,
            backgroundColor: "#0F1012",
            dark: { image: `${IMAGES}/splash-icon-dark.png`, backgroundColor: "#000000" },
          },
        ],
      ],
    },
  };
};
