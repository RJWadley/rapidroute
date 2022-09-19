import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"
import { getAnalytics } from "firebase/analytics"
import { isBrowser } from "utils/functions"

const firebaseConfig = {
  apiKey: "AIzaSyAk72DEr-1lB3XeRWIHKQ-yq_mTytWXxoo",
  authDomain: "rapidroute-7beef.firebaseapp.com",
  databaseURL: "https://rapidroute-7beef-default-rtdb.firebaseio.com",
  projectId: "rapidroute-7beef",
  storageBucket: "rapidroute-7beef.appspot.com",
  messagingSenderId: "967487541876",
  appId: "1:967487541876:web:f987b300677d9710e5b721",
  measurementId: "G-3SEGJSYBBW",
}

export const app = initializeApp(firebaseConfig)
export const database = getDatabase(app)
export const analytics = isBrowser() && getAnalytics(app)
