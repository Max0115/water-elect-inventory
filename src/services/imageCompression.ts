/**
 * 解析圖片的 EXIF Orientation 標籤
 * @param file 圖片檔案
 * @returns 旋轉方向 (1-8)
 */
async function getOrientation(file: File): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const view = new DataView(e.target?.result as ArrayBuffer);
      if (view.byteLength < 2 || view.getUint16(0, false) !== 0xffd8) {
        return resolve(1);
      }
      const length = view.byteLength;
      let offset = 2;
      while (offset < length) {
        if (offset + 2 > length) break;
        const marker = view.getUint16(offset, false);
        offset += 2;
        if (marker === 0xffe1) {
          if (offset + 6 > length) break;
          offset += 2;
          if (view.getUint32(offset, false) !== 0x45786966) {
            return resolve(1);
          }
          const little = view.getUint16(offset += 6, false) === 0x4949;
          offset += view.getUint32(offset + 4, little);
          if (offset + 2 > length) break;
          const tags = view.getUint16(offset, little);
          offset += 2;
          for (let i = 0; i < tags; i++) {
            if (offset + (i * 12) + 12 > length) break;
            if (view.getUint16(offset + (i * 12), little) === 0x0112) {
              return resolve(view.getUint16(offset + (i * 12) + 8, little));
            }
          }
        } else if ((marker & 0xff00) !== 0xff00) {
          break;
        } else {
          offset += view.getUint16(offset, false);
        }
      }
      return resolve(1);
    };
    // 僅讀取前 64KB，足以包含 EXIF 資訊
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
  });
}

/**
 * 壓縮圖片並處理方向問題
 * @param file 原始圖片檔案
 * @param maxWidth 最大寬度
 * @param maxHeight 最大高度
 * @param quality 壓縮品質 (0 到 1)
 * @returns 壓縮後的 Base64 字串
 */
export async function compressImage(file: File, maxWidth = 1280, maxHeight = 1280, quality = 0.75): Promise<string> {
  try {
    const orientation = await getOrientation(file);
    const objectUrl = URL.createObjectURL(file);

    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        
        let width = img.width;
        let height = img.height;

        // 計算維持長寬比的新尺寸
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          return reject(new Error('無法取得 Canvas 內容'));
        }

        // 處理 EXIF 方向
        if ([5, 6, 7, 8].includes(orientation)) {
          canvas.width = height;
          canvas.height = width;
        } else {
          canvas.width = width;
          canvas.height = height;
        }

        ctx.save();
        switch (orientation) {
          case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
          case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
          case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
          case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
          case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
          case 7: ctx.transform(0, -1, -1, 0, height, width); break;
          case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
          default: break;
        }

        ctx.drawImage(img, 0, 0, width, height);
        ctx.restore();

        const dataUrl = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality);
        resolve(dataUrl);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('圖片載入失敗'));
      };
      
      img.src = objectUrl;
    });
  } catch (error) {
    console.error('圖片壓縮過程中發生錯誤:', error);
    throw error;
  }
}
