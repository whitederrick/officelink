# OFFICELINK — 웹/백엔드 컨테이너 이미지
# 멀티스테이지 빌드: deps → build → runtime
# 데이터는 /app/.data 볼륨에 영속(파일 저장소). 실 DB 전환 후에는 불필요.

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV OFFICELINK_DATA_DIR=/app/.data
# 런타임에 필요한 산출물만 복사
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
RUN mkdir -p /app/.data
EXPOSE 3000
CMD ["npm", "run", "start"]
