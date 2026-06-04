import { createStore } from 'vuex';
import Worker from 'worker-loader!@/js/img-worker';
import AudioWorker from 'worker-loader!@/js/audio-worker';
import VideoWorker from 'worker-loader!@/js/video-worker';
import DocWorker from 'worker-loader!@/js/doc-worker';
import ArchiveWorker from 'worker-loader!@/js/archive-worker';
import FontWorker from 'worker-loader!@/js/font-worker';
import MergeWorker from 'worker-loader!@/js/merge-worker';
import { FILE_STATUS } from '@/js/constants';
import { MagickFormat } from "@imagemagick/magick-wasm/magick-format";
import { createMediaMutations, createMediaActions } from './media-type-helpers';

export default createStore({
    state: {
        files: [],
        nextIndex: 0,
        worker: null,
        formats: [
            {
                name: 'jpg',
                extension: 'jpg',
                title:'Joint Photographic Experts Group',  
                description: 'A JPG file is a raster image saved in the JPEG format, commonly used to store digital photographs and graphics created by image-editing software. JPEG features lossy compression that can significantly reduce the size of an image without much degradation and supports up to 16,777,216 colors.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Jpg,
            },
            {
                name: 'jpeg',
                extension: 'jpeg',
                title:'Joint Photographic Experts Group', 
                description: 'A JPEG file is an image saved in a compressed graphic format standardized by the Joint Photographic Experts Group (JPEG). It supports up to 24-bit color and utilizes lossy compression, which may noticeably reduce the image quality if high amounts are applied. Users commonly save digital photos and web graphics as JPEG files.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Jpeg,
            },
            {
                name: 'png',
                extension: 'png',
                title:'Portable Network Graphic',  
                description: 'A PNG file is an image saved in the Portable Network Graphic (PNG) format, commonly used to store web graphics, digital photographs, and images with transparent backgrounds. It is a raster graphic similar to a .JPG image but is compressed with lossless compression and supports transparency.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Png,
            },
            {
                name: 'tiff',
                extension: 'tiff',
                title:'Tagged Image File Format',  
                description: 'A TIFF file is a graphics container that stores raster images in the Tagged Image File Format (TIFF). It contains high-quality graphics that support color depths from 1 to 24-bit and supports both lossy and lossless compression. TIFF files also support multiple layers and pages.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Tiff,
            },
            {
                name: 'webp',
                extension: 'webp',
                title:'WebP',  
                description: 'A WEBP file is an image saved in the WebP (pronounced "Weppy") raster image format developed by Google for web graphics. The WebP format reduces file size more than standard JPEG compression while maintaining similar or better image quality. It supports both lossy and lossless compression and includes an alpha channel for transparency, similar to the PNG format.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Webp,
            },
            {
                name: 'gif',
                extension: 'gif',
                title:'Graphical Interchange Format File', 
                description: 'A GIF file is an image saved in the Graphical Interchange Format (GIF). It may contain up to 256 indexed colors, with a color palette that may be a predefined set of colors or adapted to the colors in the image. GIF files are saved in a lossless format, meaning that the GIF compression does not degrade the image\'s clarity.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Gif,
            },
            {
                name: 'bmp',
                extension: 'bmp',
                title:'Bitmap Image',  
                description: 'A BMP file is an image saved in the Bitmap (BMP) raster image format developed by Microsoft. It contains uncompressed image data that supports monochrome and color images at variable color bit depths and image metadata. Users commonly save digital photos as BMP files.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Bmp,
            },
            {
                name: 'svg',
                extension: 'svg',
                title:'Scalable Vector Graphics File',  
                description: 'An SVG file is a graphic saved in a two-dimensional vector graphic format created by the World Wide Web Consortium (W3C). It stores information that describes an image in a text format based on XML. SVG files may include vector shapes, embedded raster graphics (also known as bitmap images), and text.', 
                canConvertFrom: false, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Svg,
            },
            {
                name: 'psd',
                extension: 'psd',
                title:'Adobe Photoshop Document',  
                description: 'A PSD file is an image file created by Adobe Photoshop, a professional image-editing program used to enhance digital photos and create web graphics. It is the native format used to save files in Photoshop. PSD files may include image layers, adjustment layers, layer masks, annotations, file information, keywords, and other Photoshop-specific elements. They are commonly created and shared among graphics professionals.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Psd,
            },
            {
                name: 'ai',
                extension: 'ai',
                title:'Adobe Illustrator Artwork', 
                description: 'An AI file is a vector graphic saved in the Adobe Illustrator Artwork (AI) format. It is created by Adobe Illustrator or exported by another graphics application, such as Adobe Photoshop. AI files are saved in a vector format that comprises paths connected by points rather than bitmap image data, allowing users to enlarge them without losing any image quality.', 
                canConvertFrom: false, intermdeiate: ['png','gif','jpg', 'webp'],
                canConvertTo: true,
                magickFormat: MagickFormat.Ai,
            },
            {
                name: 'eps',
                extension: 'eps',
                title:'Encapsulated PostScript File',  
                description: 'An EPS file is a vector graphic saved in the Encapsulated PostScript (EPS) format. It contains PostScript-formatted image data, which is ideal for scaling high-resolution images, and may include bitmap image data and text. EPS files also store a low-resolution embedded bitmap image for previewing the graphic.', 
                canConvertFrom: false, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Eps,
            },
          
            {
                name: 'svgz',
                extension: 'svgz',
                title:'Compressed SVG File',  
                description: 'An SVGZ file is a Scalable Vector Graphics (.SVG) file compressed with gzip compression. It contains graphics data in XML, which includes the positioning of lines, text, curves, colors, and shapes that make up a two-dimensional graphic. SVGZ files also support layers, transparency, gradients, animations, and filters.', 
                canConvertFrom: false, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Svgz,
            },
            
            {
                name: 'dcx',
                extension: 'dcx',
                title:'Zsoft Multi-Page Paintbrush File',  
                description: 'Multi-page image file created by various image programs; contains a small header that identifies the DCX file followed by a sequence of .PCX files; commonly used to create digital fax files.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Dcx,
            },
            {
                name: 'dds',
                extension: 'dds',
                title:'DirectDraw Surface Image',  
                description: 'A DDS file is a raster image saved in the DirectDraw Surface (DDS) container format. It can store compressed and uncompressed pixel formats DDS files are often used for texturing video game unit models, but may also be used to store digital photos and Windows desktop backgrounds.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Dds,
            },
            {
                name: 'dpx',
                extension: 'dpx',
                title:'Digital Picture Exchange File',  
                description: 'A DPX file is a raster image saved in the Digital Picture Exchange (DPX) format, which is primarily used for transferring film images to a digital medium without loss of quality. It may contain a single frame but is typically exported as a frame sequence that contains a series of still images.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Dpx,
            },
            {
                name: 'exr',
                extension: 'exr',
                title:'OpenEXR Image',  
                description: 'An EXR file is a raster image stored in the OpenEXR format, a high dynamic-range (HDR) image format developed by Academy Software Foundation (ASWF). The EXR format supports multi-layer images, lossy and lossless compression, and 16-bit and 32-bit pixels.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Exr,
            },
            {
                name: 'fits',
                extension: 'fits',
                title:'Flexible Image Transport System File',  
                description: 'Bitmap graphic created in the FITS (Flexible Image Transport System) format, which was originally specified by the International Astronomical Union (IAU); may contain both binary data and ASCII text; used as a standard format for storing astronomical data.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Fits,
            },
            
            {
                name: 'jfif',
                extension: 'jfif',
                title:'JPEG File Interchange Format',  
                description: 'A JFIF file is a bitmap graphic that uses JPEG compression. It is saved using a variation of the common .JPEG file format, designed to include a minimal amount of data and allow easy exchange across multiple platforms and applications.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Jiff,
            },
            {
                name: 'jpc',
                extension: 'jpc',
                title:'JPEG 2000 Code Stream File',  
                description: 'Image format that uses JPEG 2000 advanced wavelet compression; supports color depths of 8, 24, and 32 bits per pixel; also supports grayscale, RGB, YCbCr, XYZ, and Lab color spaces.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Jpc,
            },
            {
                name: 'jpe',
                extension: 'jpe',
                title:'JPEG 2000 Code Stream File',  
                description: 'Image format that uses JPEG 2000 advanced wavelet compression; supports color depths of 8, 24, and 32 bits per pixel; also supports grayscale, RGB, YCbCr, XYZ, and Lab color spaces.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Jpe,
            },
            {
                name: 'jps',
                extension: 'jps',
                title:'Stereo JPEG Image',  
                description: 'A JPS file is a stereoscopic JPEG image used for creating 3D effects from 2D images. It contains two static images, one for the left eye and one for the right eye that are encoded as two side-by-side images in a single .JPG file.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Jps,
            },
            {
                name: 'jpm',
                extension: 'jpm',
                title:'JPEG 2000 Multi-layer bitmap file',  
                description: 'JPM files mostly belong to LuraDocument.jpm by Algo Vision LuraTech GmbH. An implementation of the new ISO standard JPEG2000/Part6 which is compression technology for scanned colored documents containing both bilevel elements (text, technical drawings) and images.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Jpm,
            },
           
            {
                name: 'jng',
                extension: 'jng',
                title:'JPEG Network Graphic',  
                description: 'Image file format related to the .PNG format, but uses lossy compression like standard .JPG files; developed as a sub-format for .MNG objects, but can also be used as a standalone raster image format.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Jng,
            },
            {
                name: 'j2c',
                extension: 'j2c',
                title:'JPEG 2000 Code Stream',  
                description: 'Bitmap image created using JPEG 2000 compression, which is similar to standard .JPG compression but uses a newer encoding standard that allows flexibility at the cost of computational complexity; can be viewed by most applications that support standard .JP2 files.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.J2c,
            },
            {
                name: 'j2k',
                extension: 'j2k',
                title:'JPEG 2000 Image',  
                description: 'Compressed bitmap image that uses wavelet compression instead of the DCT compression used by standard .JPEG images; supports 16-bit color, alpha transparency, and lossless compression.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.J2k,
            },
            {
                name: 'miff',
                extension: 'miff',
                title:'Magick Image File',  
                description: 'Image format used by ImageMagick, a program used to view, edit, and convert image formats; stores one or more bitmap images, along with any metadata, such as the author, copyright, image color profiles, and comments.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Miff,
            },
            {
                name: 'mng',
                extension: 'mng',
                title:'Multiple-image Network Graphic',  
                description: 'An MNG file is an animated image saved in the Multiple-image Network Graphics (MNG) file format. It contains multiple .PNG images that are shown in sequence to convey motion or animation. MNG files are similar to animated .GIF files, but use higher compression and support full alpha (multi-level transparency).', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Mng,
            },
            {
                name: 'palm',
                extension: 'palm',
                title:'Palm Pixmap',  
                description: 'This format is used for storing bitmap images. It supports many different file types and compression algorithms. One Palm bitmap file can contain multiple versions of the same images with different colors. These files are used on PALM devices.', 
                canConvertFrom: false, 
                canConvertTo: true,
                intermdeiate: ['png','gif'],
                magickFormat: MagickFormat.Palm,
            },
            {
                name: 'pam',
                extension: 'pam',
                title:'Common 2-dimensional bitmap format',  
                description: '', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Pam,
            },
            {
                name: 'pbm',
                extension: 'pbm',
                title:'Portable Bitmap',  
                description: 'PBM is a Portable image in black and white. Can be opened with programs: Adobe Photoshop CS, ACD Systems Canvas 15, ACD Systems ACDSee 17, Newera Graphics Converter Pro, Corel PaintShop Pro X6. File contains 1 bit per pixel. PBM is a kind of file format PPM. And can be readable or binary.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Pbm,
            },
            {
                name: 'pcd',
                extension: 'pcd',
                title:'Photo CD',  
                description: 'This format was developed by Kodak in order to store images on optical or other media. It is used as a format for archiving scanned documents on Kodak devices. It encodes images in 24-bit color and supports resolutions of up to 6144x4096 pixels.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Pcd,
            },
            {
                name: 'pcds',
                extension: 'pcds',
                title:'Photo CD',  
                description: 'PCDS files mostly belong to Photo-CD Image. multi-resolution : Bitmap graphics - Kodak Photo-CD format', canConvertFrom: true, intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Pcds,
            },
            {
                name: 'pcl',
                extension: 'pcl',
                title:'Printer Command Language Document',  
                description: 'A PCL file is a digital printed document created in the Printer Command Language (PCL) page description language. It describes the layout of text and graphics for the document. The PCL format was originally used by Hewlett-Packard printers in the 1980s and is now used by HP LaserJet printers and others. PCL is widely-used but offers fewer features than the PostScript (.PS) format.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Pcl,
            },
            {
                name: 'pcx',
                extension: 'pcx',
                title:'Paintbrush Bitmap Image File',  
                description: 'Raster image format developed by ZSoft; became one of the original bitmap image formats for the DOS/Windows platform; supports 24-bit color images, 8-bit grayscale and indexed color images, and 1-bit black and white images; compressed using RLE encoding.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Pcx,
            },
            {
                name: 'pfa',
                extension: 'pfa',
                title:'PostScript Type 1',  
                description: 'This is a 7-bit font format used for directly downloading to a PostScript printer. It has two character encoding in hexadecimal. It has good compatibility with multiple font formats. PFA contains an outline for font symbols and is formatted in ASCII text data.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Pfa,
            },
            {
                name: 'pgm',
                extension: 'pgm',
                title:'Portable Graymap',  
                description: 'PGM is a storage format for grayscale images. Files in this format can be opened using software: ACDSee Photo Manager 14, ACD Systems Canvas 15, Corel PaintShop Pro X4. This type of file can be edited with a text editor. PGM files can be in two versions: P2 / P5. P2 are readable, P5 - to binary formats.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Pgm,
            },
            {
                name: 'psb',
                extension: 'psb',
                title:'Photoshop Large Document Format',  
                description: 'A PSB file is an image file created by Adobe Photoshop, a professional image-editing application. It contains an image that is larger than 30,000 x 30,000 pixels or 2 GB in size. PSB files are nearly identical to .PSD files except that they contain large images, so they tend to have large file sizes.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Psb,
            },
            {
                name: 'ptif',
                extension: 'ptif',
                title:'Pyramid Encoded TIFF',  
                description: 'PTIF files mostly belong to Pyramid Encoded TIFF. (multiple resolutions in one file)', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Ptif,
            },
            {
                name: 'p7',
                extension: 'p7',
                title:'PKCS #7 Digital Certificate File',  
                description: 'Digital certificate file used by various applications for authentication; contains a key that was generated using the Public-Key Cryptography Standards (PKCS) #7 specification; more commonly seen with the .P7C extension.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.P7,
            },
            {
                name: 'ras',
                extension: 'ras',
                title:'Remedy Archive System File',  
                description: 'Game resource file used by Max Payne video games; contains default information referenced by the game, such as textures, models, level data, and music; similar to .MPM files.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Ras,
            },

            {
                name: 'sgi',
                extension: 'sgi',
                title:'Silicon Graphics Image File',  
                description: 'Image saved in the native graphics format used by Silicon Graphics workstations; can store 8 to 32 bits per pixel; also supports Run-length encoding (RLE) compression for reducing the image file size.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Sgi,
            },
      
            {
                name: 'sun',
                extension: 'sun',
                title:'Sun Raster Graphic File',  
                description: 'Bitmap image generated by a Sun Microsystems workstation; native graphic format used by the Sun Unix operating system; uses a standard image format that can be read by several graphics programs.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Sun,
            },
            {
                name: 'tga',
                extension: 'tga',
                title:'Targa Graphic',  
                description: 'A TGA file is an image saved in the Targa raster graphic format designed by Truevision. It supports 8, 16, 24, or 32 bits per pixel at a maximum of 24 bits for RGB colors and an 8-bit alpha channel. TGA files are used for various types of images, such as digital photos and textures referenced by 3D video games.', 
                canConvertFrom: false, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Tga,
            },
            {
                name: 'vda',
                extension: 'vda',
                title:'Targa Bitmap Image File',  
                description: 'Raster image formatted in the Targa Truevision format; stores image data using 1 to 32 bits per pixel, with 24 bits possible for the RGB data and 8 bits for the alpha (opacity)channel.', 
                canConvertFrom: false, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Vda,
            },
            {
                name: 'vicar',
                extension: 'vicar',
                title:'VICAR Image File',  
                description: 'Raster image format developed by NASA\'s Jet Propulsion Laboratory; stores an image that has been taken on a mission by NASA\'s spacecraft; also contains information that describes the structure and type of data along with a history of processing that has been done to the image.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Vicar,
            },
            {
                name: 'viff',
                extension: 'viff',
                title:'Visualization Image File Format',  
                description: 'Image file used by VisiQuest Khoros, an software development kit (SDK) used to develop imaging software and other visualization tools; stores a bitmap image using color "bands;" may optionally store one or more color maps.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Viff,
            },
            {
                name: 'vips',
                extension: 'vips',
                title:'VIPS Image',  
                description: 'VIPS is a format used by libvips internally for calculation but it can also be used for storing images. It is simple, fast and has no size limit. However, only a few other programs are able to open such files which is why it is better to convert them to a more popular format.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Vips,
            },
            {
                name: 'xbm',
                extension: 'xbm',
                title:'X Windows system bitmap (black and white)',  
                description: 'This is a monochrome image format with a bitmap structure. It is used to store images of icons and cursors in the X Window System graphical user interface, which is used for remote connections. The structure of an XBM file consists of simple text written in the C programming language.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Xbm,
            },
            {
                name: 'xpm',
                extension: 'xpm',
                title:'X Windows system pixmap (color)',  
                description: 'This is an image file format written in textual form in the C language. It is used in the X Windows System interface for remote connections, which is designed to serve clients and servers. This format can be used to store color and monochrome images.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Xpm,
            },
            {
                name: 'xv',
                extension: 'xv',
                title:'Khoros Visualization image',  
                description: 'This is an image format that is used for visualization in the Khoros software suite. It is a kind of VIFF bitmap image. The format consists of color zones. It is used for visualization purposes in software for both commercial and scientific purposes.', 
                canConvertFrom: true, 
                canConvertTo: true,
                intermdeiate: ['png','gif','jpg', 'webp'],
                magickFormat: MagickFormat.Xv,
            }, 
        ],

        config: {
            format: null,
        },

        // ── Audio ────────────────────────────────────────────────────────────
        audioFiles: [],
        audioNextIndex: 0,
        audioWorker: null,
        audioConfig: { format: null },
        audioFormats: [
            {
                name: 'mp3',
                extension: 'mp3',
                title: 'MPEG Audio Layer III',
                description: 'MP3 is the most popular digital audio format. It uses lossy compression to reduce file size while maintaining acceptable quality. Supported by virtually every device and media player.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'audio/mpeg',
            },
            {
                name: 'wav',
                extension: 'wav',
                title: 'Waveform Audio File',
                description: 'WAV is a lossless audio format developed by Microsoft and IBM. It stores uncompressed PCM audio, making it ideal for professional audio work where quality must be preserved.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'audio/wav',
            },
            {
                name: 'ogg',
                extension: 'ogg',
                title: 'Ogg Vorbis Audio',
                description: 'OGG is a free, open-source container format typically used with the Vorbis audio codec. It provides good compression and quality and is widely supported by modern browsers and players.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'audio/ogg',
            },
            {
                name: 'flac',
                extension: 'flac',
                title: 'Free Lossless Audio Codec',
                description: 'FLAC is a popular lossless audio format that compresses audio without any quality loss. It is often used for archiving music and high-fidelity listening.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'audio/flac',
            },
            {
                name: 'aac',
                extension: 'aac',
                title: 'Advanced Audio Coding',
                description: 'AAC is a lossy audio format designed as the successor to MP3. It provides better sound quality at similar bit rates and is used by Apple, YouTube, and many streaming services.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'audio/aac',
            },
            {
                name: 'm4a',
                extension: 'm4a',
                title: 'MPEG-4 Audio',
                description: 'M4A is an audio-only MPEG-4 container typically holding AAC audio. It is the standard audio format used by iTunes and Apple devices.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'audio/mp4',
            },
            {
                name: 'opus',
                extension: 'opus',
                title: 'Opus Audio',
                description: 'Opus is a versatile open-source audio codec designed for interactive speech and music transmission. It offers excellent quality at low bit rates and is used in WebRTC and streaming.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'audio/ogg; codecs=opus',
            },
            {
                name: 'webm',
                extension: 'webm',
                title: 'WebM Audio',
                description: 'WebM is an open, royalty-free media format developed for the web. As an audio container it typically holds Opus or Vorbis audio and is supported by all modern browsers.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'audio/webm',
            },
            {
                name: 'wma',
                extension: 'wma',
                title: 'Windows Media Audio',
                description: 'WMA is a lossy audio format developed by Microsoft. It is commonly used on Windows systems and older media players.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'audio/x-ms-wma',
            },
            {
                name: 'alac',
                extension: 'alac',
                title: 'Apple Lossless Audio Codec',
                description: 'ALAC is Apple\'s lossless audio codec used for high-quality audio in Apple ecosystems and archival workflows.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'audio/alac',
            },
            {
                name: 'ape',
                extension: 'ape',
                title: 'Monkey\'s Audio',
                description: 'APE is a lossless audio format focused on high compression ratios while preserving original audio quality.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'audio/ape',
            },
        ],

        // ── Video ────────────────────────────────────────────────────────────
        videoFiles: [],
        videoNextIndex: 0,
        videoWorker: null,
        videoConfig: { format: null },
        videoFormats: [
            {
                name: 'mp4',
                extension: 'mp4',
                title: 'MPEG-4 Video',
                description: 'MP4 is the most widely used video container format. It supports H.264, H.265, and other modern codecs and is compatible with virtually every device and streaming platform.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'video/mp4',
            },
            {
                name: 'webm',
                extension: 'webm',
                title: 'WebM Video',
                description: 'WebM is an open, royalty-free video format designed for web use. It supports VP8, VP9, and AV1 codecs with Vorbis or Opus audio, and plays natively in all modern browsers.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'video/webm',
            },
            {
                name: 'mkv',
                extension: 'mkv',
                title: 'Matroska Video',
                description: 'MKV is a flexible open-standard multimedia container that can hold virtually any video and audio codec. It is popular for storing high-quality video and multiple audio/subtitle tracks.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'video/x-matroska',
            },
            {
                name: 'mov',
                extension: 'mov',
                title: 'Apple QuickTime Movie',
                description: 'MOV is a video container developed by Apple for QuickTime. It supports high-quality video and is commonly used for video editing and professional workflows on macOS.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'video/quicktime',
            },
            {
                name: 'avi',
                extension: 'avi',
                title: 'Audio Video Interleave',
                description: 'AVI is a classic video container developed by Microsoft. While it lacks modern features, it remains widely used and is supported by almost all media players.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'video/x-msvideo',
            },
            {
                name: 'wmv',
                extension: 'wmv',
                title: 'Windows Media Video',
                description: 'WMV is a video format developed by Microsoft. It is common on Windows systems and older media players.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'video/x-ms-wmv',
            },
            {
                name: 'flv',
                extension: 'flv',
                title: 'Flash Video',
                description: 'FLV was the standard format for web video during the Flash era and is still encountered in legacy content.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'video/x-flv',
            },
            {
                name: '3gp',
                extension: '3gp',
                title: '3GPP Multimedia File',
                description: '3GP is a multimedia container format used on mobile phones. It is defined by the Third Generation Partnership Project and supports both audio and video.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'video/3gpp',
            },
            {
                name: 'mpeg',
                extension: 'mpeg',
                title: 'MPEG Video',
                description: 'MPEG is one of the earliest digital video standards. MPEG-1 and MPEG-2 files are still encountered in legacy media and can be converted to modern formats.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'video/mpeg',
            },
            {
                name: 'm3u8',
                extension: 'm3u8',
                title: 'HLS Playlist',
                description: 'M3U8 is a UTF-8 playlist format commonly used by HTTP Live Streaming (HLS) workflows.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'application/vnd.apple.mpegurl',
            },
            {
                name: 'ts',
                extension: 'ts',
                title: 'MPEG Transport Stream',
                description: 'TS is a transport stream container widely used in broadcast and streaming pipelines.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'video/mp2t',
            },
            {
                name: 'ogv',
                extension: 'ogv',
                title: 'Ogg Video',
                description: 'OGV is the Ogg video container typically carrying Theora or other Ogg-compatible video codecs.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'video/ogg',
            },
        ],

        // ── Document ─────────────────────────────────────────────────────────
        documentFiles: [],
        documentNextIndex: 0,
        documentWorker: null,
        documentConfig: { format: null, inputFormat: null },
        documentFormats: [
            // ── Input + Output ───────────────────────────────────────────────
            {
                name: 'markdown',
                extension: 'md',
                title: 'Markdown',
                description: 'Standard Markdown format with support for common text formatting, code blocks, lists, and links.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'text/markdown',
            },
            {
                name: 'gfm',
                extension: 'md',
                title: 'GitHub Flavored Markdown',
                description: 'GitHub Flavored Markdown (GFM) is the dialect of Markdown used on GitHub and many other platforms, supporting task lists, tables, and strikethrough.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'text/markdown',
            },
            {
                name: 'commonmark',
                extension: 'md',
                title: 'CommonMark',
                description: 'A strongly specified, highly compatible implementation of Markdown designed to be unambiguous and consistent.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'text/markdown',
            },
            {
                name: 'html',
                extension: 'html',
                title: 'HTML',
                description: 'HyperText Markup Language — the standard language for creating web pages. Pandoc can read and write full HTML5 documents.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'text/html',
            },
            {
                name: 'docx',
                extension: 'docx',
                title: 'Microsoft Word',
                description: 'The modern Microsoft Word document format (.docx) based on the Open XML standard. Widely used in offices and businesses worldwide.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            },
            {
                name: 'odt',
                extension: 'odt',
                title: 'OpenDocument Text',
                description: 'The open standard document format used by LibreOffice, Apache OpenOffice, and other office suites.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'application/vnd.oasis.opendocument.text',
            },
            {
                name: 'rst',
                extension: 'rst',
                title: 'reStructuredText',
                description: 'A lightweight markup language used extensively in the Python community and by Sphinx for documentation.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'text/x-rst',
            },
            {
                name: 'latex',
                extension: 'tex',
                title: 'LaTeX',
                description: 'A high-quality typesetting system widely used for scientific and academic publications, especially in mathematics and physics.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'application/x-latex',
            },
            {
                name: 'org',
                extension: 'org',
                title: 'Emacs Org-mode',
                description: 'A powerful plain-text format for notes, project planning, literate programming, and more in Emacs.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'text/plain',
            },
            {
                name: 'mediawiki',
                extension: 'wiki',
                title: 'MediaWiki Markup',
                description: 'The wiki markup language used by Wikipedia and other MediaWiki-powered sites.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'text/plain',
            },
            {
                name: 'textile',
                extension: 'textile',
                title: 'Textile',
                description: 'A lightweight markup language with a focus on readability used in many content management systems.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'text/x-textile',
            },
            {
                name: 'asciidoc',
                extension: 'adoc',
                title: 'AsciiDoc',
                description: 'A human-readable document format semantically equivalent to DocBook XML, widely used for technical documentation.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'text/x-asciidoc',
            },
            {
                name: 'epub',
                extension: 'epub',
                title: 'EPUB',
                description: 'The open standard e-book format supported by virtually all e-readers (except Kindle).',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'application/epub+zip',
            },
            {
                name: 'rtf',
                extension: 'rtf',
                title: 'Rich Text Format',
                description: 'A cross-platform document format developed by Microsoft, readable by most word processors.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'application/rtf',
            },
            {
                name: 'ipynb',
                extension: 'ipynb',
                title: 'Jupyter Notebook',
                description: 'The native format of Jupyter/IPython notebooks containing code, markdown, and rich outputs.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'application/x-ipynb+json',
            },
            {
                name: 'jira',
                extension: 'jira',
                title: 'Jira / Confluence Markup',
                description: 'The wiki markup language used in Atlassian\'s Jira and Confluence products.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'text/plain',
            },
            {
                name: 'json',
                extension: 'json',
                title: 'Pandoc JSON AST',
                description: 'Pandoc\'s native JSON representation of the abstract syntax tree, useful for programmatic document processing.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'application/json',
            },
            {
                name: 'typst',
                extension: 'typ',
                title: 'Typst',
                description: 'A modern typesetting system designed as a user-friendly alternative to LaTeX.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'text/plain',
            },
            {
                name: 'docbook',
                extension: 'xml',
                title: 'DocBook XML',
                description: 'A semantic markup language for technical documentation, widely used for books, manuals, and reference documentation.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'application/xml',
            },
            {
                name: 'opml',
                extension: 'opml',
                title: 'OPML',
                description: 'Outline Processor Markup Language — an XML format for outlines, commonly used for RSS feed lists and outliners.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'text/x-opml',
            },
            {
                name: 'fb2',
                extension: 'fb2',
                title: 'FictionBook2',
                description: 'An XML-based e-book format popular in Russia and Eastern Europe, supported by many e-book readers.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'application/x-fictionbook+xml',
            },
            {
                name: 'muse',
                extension: 'muse',
                title: 'Muse',
                description: 'Emacs Muse is a publishing environment for Emacs that uses a simple wiki-like markup language.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'text/plain',
            },
            {
                name: 'djot',
                extension: 'dj',
                title: 'Djot',
                description: 'A modern lightweight markup language designed as a successor to CommonMark, with a precise specification.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'text/plain',
            },
            {
                name: 'native',
                extension: 'hs',
                title: 'Pandoc Native',
                description: 'Pandoc\'s native Haskell representation of a document, useful for debugging and advanced processing.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'text/plain',
            },
            {
                name: 'man',
                extension: 'man',
                title: 'Unix Man Page',
                description: 'The traditional Unix manual page format rendered by the man command.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'text/troff',
            },
            {
                name: 'bibtex',
                extension: 'bib',
                title: 'BibTeX',
                description: 'A reference management software format commonly used with LaTeX for bibliographies and citations.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'text/plain',
            },
            {
                name: 'biblatex',
                extension: 'bib',
                title: 'BibLaTeX',
                description: 'An extended bibliography format for LaTeX with more features and flexibility than BibTeX.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'text/plain',
            },
            {
                name: 'csl-json',
                extension: 'json',
                title: 'CSL JSON',
                description: 'Citation Style Language JSON format for interchange of bibliographic data between systems.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'application/json',
            },
            {
                name: 'csl-yaml',
                extension: 'yaml',
                title: 'CSL YAML',
                description: 'Citation Style Language YAML format for storing bibliographic metadata.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'text/yaml',
            },
            {
                name: 'dokuwiki',
                extension: 'doku',
                title: 'DokuWiki Markup',
                description: 'The wiki markup language used by DokuWiki, a simple and lightweight wiki system.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'text/plain',
            },
            {
                name: 'haddock',
                extension: 'hs',
                title: 'Haddock Markup',
                description: 'Haddock is the standard documentation generation tool for Haskell, with a special markup syntax.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'text/plain',
            },
            {
                name: 'creole',
                extension: 'creole',
                title: 'Creole Wiki Markup',
                description: 'A standardized wiki markup language designed for interoperability between different wiki engines.',
                canConvertFrom: true,
                canConvertTo: false,
                mimeType: 'text/plain',
            },
            {
                name: 'twiki',
                extension: 'twiki',
                title: 'TWiki Markup',
                description: 'The markup language used by TWiki, an open source enterprise wiki system.',
                canConvertFrom: true,
                canConvertTo: false,
                mimeType: 'text/plain',
            },
            {
                name: 'tikiwiki',
                extension: 'tiki',
                title: 'TikiWiki Markup',
                description: 'The wiki and content management markup used by TikiWiki, a unified wiki-based platform.',
                canConvertFrom: true,
                canConvertTo: false,
                mimeType: 'text/plain',
            },
            {
                name: 'vimwiki',
                extension: 'wiki',
                title: 'Vimwiki Markup',
                description: 'A personal wiki plugin for Vim with a lightweight markup language for writing notes.',
                canConvertFrom: true,
                canConvertTo: false,
                mimeType: 'text/plain',
            },
            {
                name: 'ris',
                extension: 'ris',
                title: 'RIS',
                description: 'Research Information Systems format for storing bibliographic and research data.',
                canConvertFrom: true,
                canConvertTo: false,
                mimeType: 'text/plain',
            },
            {
                name: 'csv',
                extension: 'csv',
                title: 'CSV Tables',
                description: 'Comma-separated values format for importing tabular data from spreadsheets.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'text/csv',
            },
            {
                name: 'tsv',
                extension: 'tsv',
                title: 'TSV Tables',
                description: 'Tab-separated values format for importing tabular data with better column alignment than CSV.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'text/tab-separated-values',
            },
            {
                name: 'xlsx',
                extension: 'xlsx',
                title: 'Excel Spreadsheets',
                description: 'Microsoft Excel format for importing tabular data directly from spreadsheet files.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
            {
                name: 'xls',
                extension: 'xls',
                title: 'Excel 97-2003',
                description: 'Legacy Microsoft Excel workbook format for compatibility with older spreadsheet software.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'application/vnd.ms-excel',
            },
            {
                name: 'ods',
                extension: 'ods',
                title: 'OpenDocument Spreadsheet',
                description: 'OpenDocument spreadsheet format used by LibreOffice and other open-source office suites.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'application/vnd.oasis.opendocument.spreadsheet',
            },
            {
                name: 'pod',
                extension: 'pod',
                title: 'Perl POD',
                description: 'Plain Old Documentation format used for Perl documentation and source code comments.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'text/plain',
            },
            {
                name: 'mdoc',
                extension: 'mdoc',
                title: 'Man Page Markup',
                description: 'The mdoc macro package for formatting Unix manual pages with semantic markup.',
                canConvertFrom: true,
                canConvertTo: false,
                mimeType: 'text/troff',
            },
            {
                name: 'txt2tags',
                extension: 't2t',
                title: 'Txt2Tags',
                description: 'A lightweight markup language designed for quick document creation and conversion.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'text/plain',
            },
            {
                name: 'endnote-xml',
                extension: 'xml',
                title: 'EndNote XML',
                description: 'EndNote reference management XML format for importing bibliographic databases.',
                canConvertFrom: true,
                canConvertTo: false,
                mimeType: 'application/xml',
            },
            // ── Output-only ──────────────────────────────────────────────────
            {
                name: 'beamer',
                extension: 'tex',
                title: 'LaTeX Beamer Slides',
                description: 'LaTeX presentations using the Beamer document class — the standard for academic slide decks.',
                canConvertFrom: false,
                canConvertTo: true,
                mimeType: 'application/x-latex',
            },
            {
                name: 'pdf',
                extension: 'pdf',
                title: 'Portable Document Format',
                description: 'Publish documents as PDF output by compiling Typst generated from the source document.',
                canConvertFrom: false,
                canConvertTo: true,
                mimeType: 'application/pdf',
            },
            {
                name: 'revealjs',
                extension: 'html',
                title: 'Reveal.js HTML Slides',
                description: 'Interactive HTML presentations powered by the popular Reveal.js JavaScript framework.',
                canConvertFrom: false,
                canConvertTo: true,
                mimeType: 'text/html',
            },
            {
                name: 'slidy',
                extension: 'html',
                title: 'Slidy HTML Slides',
                description: 'Simple HTML slideshows powered by W3C\'s Slidy framework, with no external dependencies.',
                canConvertFrom: false,
                canConvertTo: true,
                mimeType: 'text/html',
            },
            {
                name: 'dzslides',
                extension: 'html',
                title: 'DZSlides',
                description: 'Minimalist, self-contained HTML5 + CSS3 slide presentations.',
                canConvertFrom: false,
                canConvertTo: true,
                mimeType: 'text/html',
            },
            {
                name: 's5',
                extension: 'html',
                title: 'S5 HTML Slides',
                description: 'A Simple Standards-Based Slide Show System using XHTML and CSS.',
                canConvertFrom: false,
                canConvertTo: true,
                mimeType: 'text/html',
            },
            {
                name: 'pptx',
                extension: 'pptx',
                title: 'PowerPoint',
                description: 'Microsoft PowerPoint presentation format, widely used in business and academia.',
                canConvertFrom: false,
                canConvertTo: true,
                mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            },
            {
                name: 'plain',
                extension: 'txt',
                title: 'Plain Text',
                description: 'Simple plain text output stripped of all formatting, useful for copy-pasting content.',
                canConvertFrom: false,
                canConvertTo: true,
                mimeType: 'text/plain',
            },
            {
                name: 'texinfo',
                extension: 'texi',
                title: 'GNU Texinfo',
                description: 'The official documentation format for GNU software, usable for both online help and printed manuals.',
                canConvertFrom: false,
                canConvertTo: true,
                mimeType: 'text/x-texinfo',
            },
            {
                name: 'context',
                extension: 'tex',
                title: 'ConTeXt',
                description: 'A TeX-based typesetting system designed to be consistent and easy to use for complex formatting.',
                canConvertFrom: false,
                canConvertTo: true,
                mimeType: 'application/x-latex',
            },
            {
                name: 'icml',
                extension: 'icml',
                title: 'InDesign ICML',
                description: 'Adobe InDesign\'s InCopy ICML format for importing structured text into InDesign layouts.',
                canConvertFrom: false,
                canConvertTo: true,
                mimeType: 'application/xml',
            },
            {
                name: 'jats',
                extension: 'xml',
                title: 'JATS XML',
                description: 'Journal Article Tag Suite XML — a standard used by publishers for archiving and exchanging journal content.',
                canConvertFrom: false,
                canConvertTo: true,
                mimeType: 'application/xml',
            },
            {
                name: 'tei',
                extension: 'xml',
                title: 'TEI Simple XML',
                description: 'Text Encoding Initiative Simple — a scholarly standard for encoding literary and linguistic texts.',
                canConvertFrom: false,
                canConvertTo: true,
                mimeType: 'application/xml',
            },
            {
                name: 'ms',
                extension: 'ms',
                title: 'Roff MS',
                description: 'The groff ms macro package for typesetting documents in the Unix roff tradition.',
                canConvertFrom: false,
                canConvertTo: true,
                mimeType: 'text/troff',
            },
            {
                name: 'xwiki',
                extension: 'txt',
                title: 'XWiki Markup',
                description: 'The markup language used by the XWiki enterprise wiki and collaboration platform.',
                canConvertFrom: false,
                canConvertTo: true,
                mimeType: 'text/plain',
            },
            {
                name: 'zimwiki',
                extension: 'txt',
                title: 'ZimWiki Markup',
                description: 'The wiki markup used by Zim, a graphical desktop wiki editor and note-taking application.',
                canConvertFrom: false,
                canConvertTo: true,
                mimeType: 'text/plain',
            },
            {
                name: 'bbcode',
                extension: 'bbcode',
                title: 'BBCode',
                description: 'Bulletin Board Code markup language commonly used in forums and online communities.',
                canConvertFrom: false,
                canConvertTo: true,
                mimeType: 'text/plain',
            },
            {
                name: 'slideous',
                extension: 'html',
                title: 'Slideous HTML Slides',
                description: 'A minimalist HTML/CSS/JavaScript-based presentation format for creating slide shows.',
                canConvertFrom: false,
                canConvertTo: true,
                mimeType: 'text/html',
            },
            {
                name: 'ansi',
                extension: 'ansi',
                title: 'ANSI Terminal',
                description: 'ANSI escape code formatted text with colors and styling for terminal output.',
                canConvertFrom: false,
                canConvertTo: true,
                mimeType: 'text/plain',
            },
            {
                name: 'vimdoc',
                extension: 'txt',
                title: 'Vim Help File',
                description: 'Vim help file format for creating documentation compatible with Vim\'s help system.',
                canConvertFrom: false,
                canConvertTo: true,
                mimeType: 'text/plain',
            },
            {
                name: 'markua',
                extension: 'markua',
                title: 'Markua',
                description: 'Markua is a Markdown variant designed for producing professional ebooks on Leanpub.',
                canConvertFrom: false,
                canConvertTo: true,
                mimeType: 'text/markdown',
            },
            {
                name: 'odt-xml',
                extension: 'xml',
                title: 'OpenDocument XML',
                description: 'The underlying XML structure of OpenDocument format for advanced document processing.',
                canConvertFrom: false,
                canConvertTo: true,
                mimeType: 'application/xml',
            },
        ],

        // ── Archive ──────────────────────────────────────────────────────────
        archiveFiles: [],
        archiveNextIndex: 0,
        archiveWorker: null,
        archiveConfig: { format: null, inputFormat: null },
        archiveFormats: [
            {
                name: 'zip',
                extension: 'zip',
                title: 'ZIP Archive',
                description: 'A common archive format supported by almost all operating systems and extraction tools.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'application/zip',
            },
            {
                name: '7z',
                extension: '7z',
                title: '7-Zip Archive',
                description: 'High-compression archive format used by 7-Zip and other archive tools.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'application/x-7z-compressed',
            },
            {
                name: 'rar',
                extension: 'rar',
                title: 'RAR Archive',
                description: 'Proprietary compressed archive format commonly used for file distribution.',
                canConvertFrom: true,
                canConvertTo: false,
                mimeType: 'application/vnd.rar',
            },
            {
                name: 'tar',
                extension: 'tar',
                title: 'TAR Archive',
                description: 'Tape Archive format that stores multiple files in a single container without compression by default.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'application/x-tar',
            },
            {
                name: 'tar.gz',
                extension: 'tar.gz',
                title: 'Compressed TAR Archive (Gzip)',
                description: 'A TAR archive compressed with gzip. Common on Unix-like systems as .tar.gz or .tgz.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'application/gzip',
            },
            {
                name: 'tar.bz2',
                extension: 'tar.bz2',
                title: 'Compressed TAR Archive (Bzip2)',
                description: 'A TAR archive compressed with bzip2, commonly distributed as .tar.bz2.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'application/x-bzip2',
            },
            {
                name: 'tar.xz',
                extension: 'tar.xz',
                title: 'Compressed TAR Archive (XZ)',
                description: 'A TAR archive compressed with xz, commonly distributed as .tar.xz.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'application/x-xz',
            },
            {
                name: 'iso',
                extension: 'iso',
                title: 'ISO Disk Image',
                description: 'ISO 9660 optical disk image containing full filesystem data.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'application/x-iso9660-image',
            },
        ],

        // ── Font ─────────────────────────────────────────────────────────────
        fontFiles: [],
        fontNextIndex: 0,
        fontWorker: null,
        fontConfig: { format: null, inputFormat: null },
        fontFormats: [
            {
                name: 'ttf',
                extension: 'ttf',
                title: 'TrueType Font',
                description: 'A widely supported outline font format used on desktop and web platforms.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'font/ttf',
            },
            {
                name: 'otf',
                extension: 'otf',
                title: 'OpenType Font',
                description: 'OpenType font format with advanced typographic capabilities and broad desktop support.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'font/otf',
            },
            {
                name: 'woff',
                extension: 'woff',
                title: 'Web Open Font Format',
                description: 'A compressed web font format used by all modern browsers.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'font/woff',
            },
            {
                name: 'woff2',
                extension: 'woff2',
                title: 'Web Open Font Format 2',
                description: 'The modern highly-compressed web font format for fast font delivery.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'font/woff2',
            },
            {
                name: 'eot',
                extension: 'eot',
                title: 'Embedded OpenType',
                description: 'Legacy web font format used by older versions of Internet Explorer.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'application/vnd.ms-fontobject',
            },
            {
                name: 'svg',
                extension: 'svg',
                title: 'SVG Font',
                description: 'XML-based font format historically used on the web and supported by conversion engines.',
                canConvertFrom: true,
                canConvertTo: true,
                mimeType: 'image/svg+xml',
            },
        ],
        // ── Merge ────────────────────────────────────────────────────────────
        mergeFiles: [],
        mergeNextIndex: 0,
        mergeWorker: null,
        mergeRunId: 0,
        mergeConfig: { family: null, format: null },
        mergeOutput: { blob: null, name: null, url: null, config: null },
        mergeStatus: FILE_STATUS.initialized,
        mergeProgress: 0,
        mergeMessage: '',
    },
    mutations: {

        setFormat(state, format) {
            state.config.format = format;
        },
        // files
        addFile(state, fileObject) {
            state.files.push(fileObject);
        },
        clearFiles(state){
            state.files = [];
            state.nextIndex = 0;
        },
        setData(state, { id, data }) {
            let file = state.files.find(file => file.id === id);
            file.output.blob = data.output;
            file.output.config = data.config;
        },
        setUrl(state, { id, url }) {
            let file = state.files.find(file => file.id === id);
            file.output.url = url;
        },
        setName(state, { id, name }) {
            let file = state.files.find(file => file.id === id);
            file.output.name = name;
        },
        setStatus(state, { id, status }) {
            let file = state.files.find(file => file.id === id);
            file.status = status;
        },
        removeFile(state, id) {
            state.files = state.files.filter(file => file.id !== id);
        },


        // others
        incrementId(state) {
            state.nextIndex++;
        },
        addWorker(state, worker) {
            state.worker = worker;
        },

        // ── Generated media-type mutations (Audio, Video, Document, Archive, Font) ──
        ...createMediaMutations('Audio', { filesKey: 'audioFiles', nextIndexKey: 'audioNextIndex', configKey: 'audioConfig' }),
        ...createMediaMutations('Video', { filesKey: 'videoFiles', nextIndexKey: 'videoNextIndex', configKey: 'videoConfig' }),
        ...createMediaMutations('Document', { filesKey: 'documentFiles', nextIndexKey: 'documentNextIndex', configKey: 'documentConfig', hasInputFormat: true }),
        ...createMediaMutations('Archive', { filesKey: 'archiveFiles', nextIndexKey: 'archiveNextIndex', configKey: 'archiveConfig', hasInputFormat: true }),
        ...createMediaMutations('Font', { filesKey: 'fontFiles', nextIndexKey: 'fontNextIndex', configKey: 'fontConfig', hasInputFormat: true }),
        // ── Merge mutations ──────────────────────────────────────────────────
        setMergeFamily(state, family) {
            state.mergeConfig.family = family;
        },
        setMergeFormat(state, format) {
            state.mergeConfig.format = format;
        },
        addMergeFile(state, fileObject) {
            state.mergeFiles.push(fileObject);
        },
        incrementMergeNextIndex(state) {
            state.mergeNextIndex++;
        },
        setMergeFiles(state, files) {
            state.mergeFiles = files;
        },
        removeMergeFile(state, id) {
            state.mergeFiles = state.mergeFiles.filter((file) => file.id !== id);
        },
        clearMergeFiles(state) {
            state.mergeFiles = [];
            state.mergeNextIndex = 0;
            state.mergeStatus = FILE_STATUS.initialized;
            state.mergeProgress = 0;
            state.mergeMessage = '';
            state.mergeOutput = { blob: null, name: null, url: null, config: null };
        },
        clearMergeOutput(state) {
            state.mergeOutput = { blob: null, name: null, url: null, config: null };
        },
        setMergeStatus(state, status) {
            state.mergeStatus = status;
        },
        setMergeProgress(state, progress) {
            state.mergeProgress = Math.max(0, Math.min(100, Number(progress) || 0));
        },
        setMergeMessage(state, message) {
            state.mergeMessage = message || '';
        },
        setMergeOutput(state, { blob, name, url, config }) {
            state.mergeOutput = { blob, name, url, config };
        },
        incrementMergeRunId(state) {
            state.mergeRunId++;
        },
        setMergeWorker(state, worker) {
            state.mergeWorker = worker;
        },
    },
    actions: {
        
        loadWorker(context) {
            let imgWorker = new Worker();
            this.state.worker = imgWorker;

            imgWorker.postMessage({
                action: 'load',
            });
            imgWorker.onmessage = (e) => {
                let status = e.data.status;
                let processMore = false;
                if (status === 'loaded') {
                    console.log('loaded');
                } else if (status === 'processed') {
                    context.commit('setStatus', { id: e.data.id, status: FILE_STATUS.processed });
                    context.commit('setData', { id: e.data.id, data: e.data });
                    processMore = true;
                } else if (status === 'failed') {
                    context.commit('setStatus', { id: e.data.id, status: FILE_STATUS.failed });
                    processMore = true;
                }

                if (processMore) {
                    context.dispatch('processAllWaiting');
                }
            };
        },
        clearFiles(context) {
            context.commit('clearFiles');
        },
        setFormat(context, format){
            context.commit('setFormat', format);
        },
        addFile(context, file) {
            let fileObject = {
                id: context.state.nextIndex,
                ogFile: file,
                name: file.name,
                status: FILE_STATUS.initialized,
                output: {
                    blob: null,
                    name: null,
                    url: null,
                    config: null,
                },
                process: [],
            }
            context.commit('incrementId');
            context.commit('addFile', fileObject);
        },
        async addFiles(context, files) {
            for (let i = 0; i < files.length; i++) {
                context.dispatch('addFile', files[i]);
                await new Promise(r => setTimeout(r, 16));
            }
        },
        processAllFiles(context) {
            let notProcessed = context.state.files.filter(file => file.status === FILE_STATUS.initialized);
            notProcessed.forEach(file => {
                context.commit('setStatus', { id: file.id, status: FILE_STATUS.waiting });
            });
            context.dispatch('processAllWaiting');
        },
        processAllWaiting(context) {
            let processesRunning = context.state.files.filter(file => file.status === FILE_STATUS.processing).length;
            if (processesRunning >= 1) return;
            let waitingFile = context.state.files.find(file => file.status === FILE_STATUS.waiting);
            if (waitingFile === undefined) return;
            context.dispatch('processFile', waitingFile.id);
        },
        processFile(context, id) {

            let file = context.state.files.find(file => file.id === id);

            let config = clone(context.state.config);


            context.state.worker.postMessage({
                action: 'process',
                file: file.ogFile,
                id: file.id,
                config: config,
            });
            context.commit('setStatus', { id: id, status: FILE_STATUS.processing });
        },

        // ── Generated media-type actions (Audio, Video, Document, Archive, Font) ──
        ...createMediaActions('Audio', {
            filesKey: 'audioFiles', nextIndexKey: 'audioNextIndex', configKey: 'audioConfig',
            workerKey: 'audioWorker', WorkerClass: AudioWorker, maxConcurrency: 1,
        }),
        ...createMediaActions('Video', {
            filesKey: 'videoFiles', nextIndexKey: 'videoNextIndex', configKey: 'videoConfig',
            workerKey: 'videoWorker', WorkerClass: VideoWorker, maxConcurrency: 1,
        }),
        ...createMediaActions('Document', {
            filesKey: 'documentFiles', nextIndexKey: 'documentNextIndex', configKey: 'documentConfig',
            workerKey: 'documentWorker', WorkerClass: DocWorker, maxConcurrency: 1, hasInputFormat: true,
        }),
        ...createMediaActions('Archive', {
            filesKey: 'archiveFiles', nextIndexKey: 'archiveNextIndex', configKey: 'archiveConfig',
            workerKey: 'archiveWorker', WorkerClass: ArchiveWorker, maxConcurrency: 1, hasInputFormat: true,
        }),
        ...createMediaActions('Font', {
            filesKey: 'fontFiles', nextIndexKey: 'fontNextIndex', configKey: 'fontConfig',
            workerKey: 'fontWorker', WorkerClass: FontWorker, maxConcurrency: 1, hasInputFormat: true,
        }),
        // ── Merge actions ────────────────────────────────────────────────────
        loadMergeWorker(context) {
            if (context.state.mergeWorker) return;
            const worker = new MergeWorker();
            context.commit('setMergeWorker', worker);
            worker.postMessage({ action: 'load' });
            worker.onmessage = (e) => {
                const { status, id } = e.data;
                if ((status === 'progress' || status === 'processed' || status === 'failed') && id !== context.state.mergeRunId) {
                    return;
                }
                if (status === 'progress') {
                    context.commit('setMergeProgress', e.data.progress);
                    context.commit('setMergeMessage', e.data.message);
                    return;
                }
                if (status === 'processed') {
                    const previousUrl = context.state.mergeOutput.url;
                    if (previousUrl) URL.revokeObjectURL(previousUrl);
                    const url = URL.createObjectURL(e.data.output);
                    context.commit('setMergeOutput', {
                        blob: e.data.output,
                        name: e.data.outputName,
                        url,
                        config: e.data.config,
                    });
                    context.commit('setMergeProgress', 100);
                    context.commit('setMergeMessage', 'Done');
                    context.commit('setMergeStatus', FILE_STATUS.processed);
                    return;
                }
                if (status === 'failed') {
                    context.commit('setMergeStatus', FILE_STATUS.failed);
                    context.commit('setMergeMessage', e.data.message || 'Merge failed');
                }
            };
        },
        clearMergeFiles(context) {
            const previousUrl = context.state.mergeOutput.url;
            if (previousUrl) URL.revokeObjectURL(previousUrl);
            if (context.state.mergeStatus === FILE_STATUS.processing) {
                context.commit('incrementMergeRunId');
            }
            context.commit('clearMergeFiles');
        },
        resetMergeResult(context) {
            const previousUrl = context.state.mergeOutput.url;
            if (previousUrl) URL.revokeObjectURL(previousUrl);
            if (context.state.mergeStatus === FILE_STATUS.processing) {
                context.commit('incrementMergeRunId');
            }
            context.commit('clearMergeOutput');
            context.commit('setMergeStatus', FILE_STATUS.initialized);
            context.commit('setMergeProgress', 0);
            context.commit('setMergeMessage', '');
        },
        setMergeFamily(context, family) {
            context.commit('setMergeFamily', family);
        },
        setMergeFormat(context, format) {
            context.commit('setMergeFormat', format);
        },
        addMergeFile(context, fileObject) {
            context.commit('addMergeFile', {
                id: context.state.mergeNextIndex,
                ogFile: fileObject.file,
                name: fileObject.file.name,
                inputFormat: fileObject.inputFormat || null,
                inputExtension: fileObject.inputExtension || null,
            });
            context.commit('incrementMergeNextIndex');
        },
        async addMergeFiles(context, files) {
            context.dispatch('resetMergeResult');
            for (let i = 0; i < files.length; i++) {
                context.dispatch('addMergeFile', files[i]);
                await new Promise((resolve) => setTimeout(resolve, 16));
            }
        },
        reorderMergeFiles(context, ids) {
            context.dispatch('resetMergeResult');
            const byId = new Map(context.state.mergeFiles.map((file) => [file.id, file]));
            const reordered = ids.map((id) => byId.get(id)).filter(Boolean);
            context.commit('setMergeFiles', reordered);
        },
        removeMergeFile(context, id) {
            context.dispatch('resetMergeResult');
            context.commit('removeMergeFile', id);
        },
        async processMerge(context) {
            if (!context.state.mergeFiles.length) return;
            context.dispatch('loadMergeWorker');
            const previousUrl = context.state.mergeOutput.url;
            if (previousUrl) URL.revokeObjectURL(previousUrl);
            context.commit('clearMergeOutput');
            context.commit('setMergeStatus', FILE_STATUS.processing);
            context.commit('setMergeProgress', 0);
            context.commit('setMergeMessage', 'Preparing');
            context.commit('incrementMergeRunId');
            context.state.mergeWorker.postMessage({
                action: 'merge',
                id: context.state.mergeRunId,
                config: clone(context.state.mergeConfig),
                files: context.state.mergeFiles.map((file) => ({
                    name: file.name,
                    inputFormat: file.inputFormat,
                    inputExtension: file.inputExtension,
                    file: file.ogFile,
                })),
            });
        },
    },
    modules: {
    }
})

function clone(object) {
    return JSON.parse(JSON.stringify(object));
}
