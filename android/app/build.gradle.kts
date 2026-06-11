plugins {
    id("com.android.application")
}

android {
    namespace = "com.erz.worldcup"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.erz.worldcup"
        minSdk = 28          // covers 1st-gen Portal / Portal+
        targetSdk = 29       // Portal hardware tops out at API 29
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        buildConfig = false
    }
}
