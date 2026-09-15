# ---- Build stage ----
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# รับค่า URL ของ Backend มาจากตอนรันคำสั่ง docker build

ENV VITE_API_URL=https://backend-913381900876.asia-southeast1.run.app

# ตั้งค่า Google Client ID สำหรับ Frontend (Public Variable)
ENV PUBLIC_GOOGLE_CLIENT_ID=1009925762161-bje0jk7iqks97bhddbes7sq2vtemh6bg.apps.googleusercontent.com

RUN npm run build

# ---- Run stage ----
FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/build build/
COPY --from=build /app/package*.json ./
RUN npm install --omit=dev

EXPOSE 3000
ENV PORT=3000

CMD ["node", "build"]
