import type {NextConfig} from 'next';
import path from 'node:path';
const nextConfig:NextConfig={
 output:'standalone',
 distDir:process.env.ARCHIVE_BUILD_TARGET==='linux'?'.next-linux':'.next',
 typescript:{tsconfigPath:process.env.ARCHIVE_BUILD_TARGET==='linux'?'tsconfig.linux.json':'tsconfig.json'},
 webpack(config,{webpack}){config.plugins.push(new webpack.NormalModuleReplacementPlugin(/^@\/lib\/runtime-env$/,path.resolve('server/linux-env.ts')));config.plugins.push(new webpack.NormalModuleReplacementPlugin(/^@\/lib\/audio$/,path.resolve('lib/audio-linux.ts')));return config;},
 serverExternalPackages:['@simplewebauthn/server','nodemailer','web-push'],
};
export default nextConfig;
