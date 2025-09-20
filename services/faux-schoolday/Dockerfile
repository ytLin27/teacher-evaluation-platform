# Faux Schoolday API Docker Configuration
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production && npm cache clean --force

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 创建日志目录
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# 复制应用代码
COPY --chown=nodejs:nodejs . .

# 切换到非 root 用户
USER nodejs

# 暴露端口
EXPOSE 3006

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http=require('http');const options={hostname:'localhost',port:3006,path:'/health',timeout:2000};const req=http.request(options,(res)=>{if(res.statusCode===200){process.exit(0)}else{process.exit(1)}});req.on('error',()=>process.exit(1));req.on('timeout',()=>process.exit(1));req.end();"

# 启动应用
CMD ["npm", "start"]