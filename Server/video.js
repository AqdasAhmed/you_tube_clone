import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

export const convertToHLS = (inputPath, outputDir, id) => {
  const safeId = id.replace(/\s+/g, '_');
  let safeOutputDir = path.resolve(path.dirname(outputDir), safeId);
  if (safeOutputDir !== outputDir) {
    console.warn(`Output directory changed to: ${safeOutputDir}`);
  }
  try {
    if (!fs.existsSync(safeOutputDir)) {
      fs.mkdirSync(safeOutputDir, { recursive: true });
      console.log(`Created outputDir: ${safeOutputDir}`);
    } else {
      console.log(`OutputDir exists: ${safeOutputDir}`);
    }
  } catch (err) {
    console.error(`Failed to create outputDir: ${safeOutputDir}`, err);
    throw err;
  }

  const thumbnailPath = path.join(safeOutputDir, 'thumbnail.jpeg');

  const thumbnailPromise = new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .on('end', () => {
        console.log('Thumbnail created');
        resolve(thumbnailPath);
      })
      .on('error', (err) => {
        console.error('Error creating thumbnail:', err);
        reject(err);
      })
      .screenshots({
        timestamps: ['00:00:01.000'],
        folder: safeOutputDir,
        filename: 'thumbnail.jpeg',
      });
  })

  const resolutions = [
    { name: '360p', width: 640, height: 360, bitrate: '800k' },
    { name: '480p', width: 854, height: 480, bitrate: '1400k' },
    // { name: '720p', width: 1280, height: 720, bitrate: '2800k' }, // Commented out to avoid high memory usage on Render
    // { name: '1080p', width: 1920, height: 1080, bitrate: '5000k' }, // Commented out to avoid high memory usage on Render
  ];

  const promises = resolutions.map(({ name, width, height, bitrate }) => {
    return new Promise((resolve, reject) => {
      const segmentDir = path.join(safeOutputDir, name);
      try {
        if (!fs.existsSync(segmentDir)) {
          fs.mkdirSync(segmentDir, { recursive: true });
          console.log(`Created segmentDir: ${segmentDir}`);
        } else {
          console.log(`segmentDir exists: ${segmentDir}`);
        }
      } catch (err) {
        console.error(`Failed to create segmentDir: ${segmentDir}`, err);
        reject(err);
        return;
      }
      const playlistPath = path.join(segmentDir, `${name}.m3u8`);
      const segmentPattern = path.join(segmentDir, `${name}_%03d.ts`);
      const absInputPath = path.isAbsolute(inputPath) ? inputPath : path.resolve(process.cwd(), inputPath);
      ffmpeg(absInputPath)
        .on('start', commandLine => {
          console.log(`Spawned ffmpeg with command: ${commandLine}`);
        })
        .on('stderr', line => {
          console.log(`ffmpeg stderr [${name}]:`, line);
        })
        .outputOptions([
          '-vf', `scale=w=${width}:h=${height}`,
          '-c:a', 'aac',
          '-ar', '48000',
          '-c:v', 'h264',
          '-profile:v', 'main',
          '-crf', '20',
          '-sc_threshold', '0',
          '-g', '48',
          '-keyint_min', '48',
          '-hls_time', '10',
          '-hls_playlist_type', 'vod',
          '-b:v', bitrate,
          '-maxrate', bitrate,
          '-bufsize', '1200k',
          '-hls_segment_filename', segmentPattern,
        ])
        .output(playlistPath)
        .on('end', () => {
          console.log(`Finished processing ${name}`);
          resolve();
        })
        .on('error', (err) => {
          console.error(`Error processing ${name}:`, err);
          reject(err);
        })
        .run();
    });
  });

  return Promise.all([thumbnailPromise, ...promises]).then(([thumbPath]) => {
    const masterPath = path.join(safeOutputDir, 'master.m3u8');
    const masterContent = resolutions
      .map(({ name, bitrate }) =>
        `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(bitrate)},RESOLUTION=${name.replace(
          'p',
          ''
        )}
      ${name}/${name}.m3u8`)
      .join('\n');

    fs.writeFileSync(masterPath, '#EXTM3U\n' + masterContent);
    console.log('Master playlist created');

    return {
      thumbnail: thumbPath,
      safeId,
      safeOutputDir
    };
  });
};