import { createStore } from 'vuex';
import Worker from 'worker-loader!@/js/img-worker';
import AudioWorker from 'worker-loader!@/js/audio-worker';
import VideoWorker from 'worker-loader!@/js/video-worker';
import DocWorker from 'worker-loader!@/js/doc-worker';
import ArchiveWorker from 'worker-loader!@/js/archive-worker';
import FontWorker from 'worker-loader!@/js/font-worker';
import { FILE_STATUS } from '@/js/constants';
import { MagickFormat } from "@imagemagick/magick-wasm/magick-format";

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
                extension: 'ext',
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
                canConvertTo: false,
                mimeType: 'text/csv',
            },
            {
                name: 'tsv',
                extension: 'tsv',
                title: 'TSV Tables',
                description: 'Tab-separated values format for importing tabular data with better column alignment than CSV.',
                canConvertFrom: true,
                canConvertTo: false,
                mimeType: 'text/tab-separated-values',
            },
            {
                name: 'xlsx',
                extension: 'xlsx',
                title: 'Excel Spreadsheets',
                description: 'Microsoft Excel format for importing tabular data directly from spreadsheet files.',
                canConvertFrom: true,
                canConvertTo: false,
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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

        // ── Audio mutations ──────────────────────────────────────────────────
        addAudioFile(state, fileObject) {
            state.audioFiles.push(fileObject);
        },
        clearAudioFiles(state) {
            state.audioFiles = [];
            state.audioNextIndex = 0;
        },
        setAudioData(state, { id, data }) {
            let file = state.audioFiles.find(f => f.id === id);
            file.output.blob = data.output;
            file.output.config = data.config;
        },
        setAudioUrl(state, { id, url }) {
            let file = state.audioFiles.find(f => f.id === id);
            file.output.url = url;
        },
        setAudioName(state, { id, name }) {
            let file = state.audioFiles.find(f => f.id === id);
            file.output.name = name;
        },
        setAudioStatus(state, { id, status }) {
            let file = state.audioFiles.find(f => f.id === id);
            file.status = status;
        },
        setAudioProgress(state, { id, progress }) {
            let file = state.audioFiles.find(f => f.id === id);
            if (!file) return;
            file.progress = Math.max(0, Math.min(100, progress));
        },
        removeAudioFile(state, id) {
            state.audioFiles = state.audioFiles.filter(f => f.id !== id);
        },
        incrementAudioId(state) {
            state.audioNextIndex++;
        },
        setAudioFormat(state, format) {
            state.audioConfig.format = format;
        },

        // ── Video mutations ──────────────────────────────────────────────────
        addVideoFile(state, fileObject) {
            state.videoFiles.push(fileObject);
        },
        clearVideoFiles(state) {
            state.videoFiles = [];
            state.videoNextIndex = 0;
        },
        setVideoData(state, { id, data }) {
            let file = state.videoFiles.find(f => f.id === id);
            file.output.blob = data.output;
            file.output.config = data.config;
        },
        setVideoUrl(state, { id, url }) {
            let file = state.videoFiles.find(f => f.id === id);
            file.output.url = url;
        },
        setVideoName(state, { id, name }) {
            let file = state.videoFiles.find(f => f.id === id);
            file.output.name = name;
        },
        setVideoStatus(state, { id, status }) {
            let file = state.videoFiles.find(f => f.id === id);
            file.status = status;
        },
        setVideoProgress(state, { id, progress }) {
            let file = state.videoFiles.find(f => f.id === id);
            if (!file) return;
            file.progress = Math.max(0, Math.min(100, progress));
        },
        removeVideoFile(state, id) {
            state.videoFiles = state.videoFiles.filter(f => f.id !== id);
        },
        incrementVideoId(state) {
            state.videoNextIndex++;
        },
        setVideoFormat(state, format) {
            state.videoConfig.format = format;
        },

        // ── Document mutations ───────────────────────────────────────────────
        addDocumentFile(state, fileObject) {
            state.documentFiles.push(fileObject);
        },
        clearDocumentFiles(state) {
            state.documentFiles = [];
            state.documentNextIndex = 0;
        },
        setDocumentData(state, { id, data }) {
            let file = state.documentFiles.find(f => f.id === id);
            file.output.blob = data.output;
            file.output.config = data.config;
        },
        setDocumentUrl(state, { id, url }) {
            let file = state.documentFiles.find(f => f.id === id);
            file.output.url = url;
        },
        setDocumentName(state, { id, name }) {
            let file = state.documentFiles.find(f => f.id === id);
            file.output.name = name;
        },
        setDocumentStatus(state, { id, status }) {
            let file = state.documentFiles.find(f => f.id === id);
            file.status = status;
        },
        setDocumentProgress(state, { id, progress }) {
            let file = state.documentFiles.find(f => f.id === id);
            if (!file) return;
            file.progress = Math.max(0, Math.min(100, progress));
        },
        removeDocumentFile(state, id) {
            state.documentFiles = state.documentFiles.filter(f => f.id !== id);
        },
        incrementDocumentId(state) {
            state.documentNextIndex++;
        },
        setDocumentFormat(state, format) {
            state.documentConfig.format = format;
        },
        setDocumentInputFormat(state, format) {
            state.documentConfig.inputFormat = format;
        },

        // ── Archive mutations ────────────────────────────────────────────────
        addArchiveFile(state, fileObject) {
            state.archiveFiles.push(fileObject);
        },
        clearArchiveFiles(state) {
            state.archiveFiles = [];
            state.archiveNextIndex = 0;
        },
        setArchiveData(state, { id, data }) {
            let file = state.archiveFiles.find(f => f.id === id);
            if (!file) return;
            file.output.blob = data.output;
            file.output.config = data.config;
        },
        setArchiveUrl(state, { id, url }) {
            let file = state.archiveFiles.find(f => f.id === id);
            if (!file) return;
            file.output.url = url;
        },
        setArchiveName(state, { id, name }) {
            let file = state.archiveFiles.find(f => f.id === id);
            if (!file) return;
            file.output.name = name;
        },
        setArchiveStatus(state, { id, status }) {
            let file = state.archiveFiles.find(f => f.id === id);
            if (!file) return;
            file.status = status;
        },
        setArchiveProgress(state, { id, progress }) {
            let file = state.archiveFiles.find(f => f.id === id);
            if (!file) return;
            file.progress = Math.max(0, Math.min(100, progress));
        },
        removeArchiveFile(state, id) {
            state.archiveFiles = state.archiveFiles.filter(f => f.id !== id);
        },
        incrementArchiveId(state) {
            state.archiveNextIndex++;
        },
        setArchiveFormat(state, format) {
            state.archiveConfig.format = format;
        },
        setArchiveInputFormat(state, format) {
            state.archiveConfig.inputFormat = format;
        },

        // ── Font mutations ───────────────────────────────────────────────────
        addFontFile(state, fileObject) {
            state.fontFiles.push(fileObject);
        },
        clearFontFiles(state) {
            state.fontFiles = [];
            state.fontNextIndex = 0;
        },
        setFontData(state, { id, data }) {
            let file = state.fontFiles.find(f => f.id === id);
            if (!file) return;
            file.output.blob = data.output;
            file.output.config = data.config;
        },
        setFontUrl(state, { id, url }) {
            let file = state.fontFiles.find(f => f.id === id);
            if (!file) return;
            file.output.url = url;
        },
        setFontName(state, { id, name }) {
            let file = state.fontFiles.find(f => f.id === id);
            if (!file) return;
            file.output.name = name;
        },
        setFontStatus(state, { id, status }) {
            let file = state.fontFiles.find(f => f.id === id);
            if (!file) return;
            file.status = status;
        },
        setFontProgress(state, { id, progress }) {
            let file = state.fontFiles.find(f => f.id === id);
            if (!file) return;
            file.progress = Math.max(0, Math.min(100, progress));
        },
        removeFontFile(state, id) {
            state.fontFiles = state.fontFiles.filter(f => f.id !== id);
        },
        incrementFontId(state) {
            state.fontNextIndex++;
        },
        setFontFormat(state, format) {
            state.fontConfig.format = format;
        },
        setFontInputFormat(state, format) {
            state.fontConfig.inputFormat = format;
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
            // run as many threads as possible
            for (let i = 0; i < navigator.hardwareConcurrency - processesRunning; i++) {
                let waitingFile = context.state.files.find(file => file.status === FILE_STATUS.waiting);
                if (waitingFile === undefined) break;

                context.dispatch('processFile', waitingFile.id);
            }
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

        // ── Audio actions ────────────────────────────────────────────────────
        loadAudioWorker(context) {
            if (context.state.audioWorker) return;
            const worker = new AudioWorker();
            context.state.audioWorker = worker;
            worker.postMessage({ action: 'load' });
            worker.onmessage = (e) => {
                const { status, id } = e.data;
                let processMore = false;
                if (status === 'progress') {
                    context.commit('setAudioProgress', { id, progress: e.data.progress });
                } else if (status === 'processed') {
                    context.commit('setAudioProgress', { id, progress: 100 });
                    context.commit('setAudioStatus', { id, status: FILE_STATUS.processed });
                    context.commit('setAudioData', { id, data: e.data });
                    processMore = true;
                } else if (status === 'failed') {
                    context.commit('setAudioStatus', { id, status: FILE_STATUS.failed });
                    processMore = true;
                }
                if (processMore) context.dispatch('processAllWaitingAudio');
            };
        },
        clearAudioFiles(context) {
            context.commit('clearAudioFiles');
        },
        setAudioFormat(context, format) {
            context.commit('setAudioFormat', format);
        },
        addAudioFile(context, file) {
            const fileObject = {
                id: context.state.audioNextIndex,
                ogFile: file,
                name: file.name,
                status: FILE_STATUS.initialized,
                progress: 0,
                output: { blob: null, name: null, url: null, config: null },
                process: [],
            };
            context.commit('incrementAudioId');
            context.commit('addAudioFile', fileObject);
        },
        async addAudioFiles(context, files) {
            for (let i = 0; i < files.length; i++) {
                context.dispatch('addAudioFile', files[i]);
                await new Promise(r => setTimeout(r, 16));
            }
        },
        processAllAudioFiles(context) {
            const notProcessed = context.state.audioFiles.filter(
                f => f.status === FILE_STATUS.initialized
            );
            notProcessed.forEach(f => {
                context.commit('setAudioStatus', { id: f.id, status: FILE_STATUS.waiting });
            });
            context.dispatch('processAllWaitingAudio');
        },
        processAllWaitingAudio(context) {
            const running = context.state.audioFiles.filter(
                f => f.status === FILE_STATUS.processing
            ).length;
            const concurrency = navigator.hardwareConcurrency || 1;
            const maxInFlight = Math.min(1, concurrency);
            for (let i = 0; i < maxInFlight - running; i++) {
                const waiting = context.state.audioFiles.find(f => f.status === FILE_STATUS.waiting);
                if (!waiting) break;
                context.dispatch('processAudioFile', waiting.id);
            }
        },
        processAudioFile(context, id) {
            const file = context.state.audioFiles.find(f => f.id === id);
            const config = clone(context.state.audioConfig);
            context.state.audioWorker.postMessage({
                action: 'process',
                file: file.ogFile,
                id: file.id,
                config,
            });
            context.commit('setAudioProgress', { id, progress: 0 });
            context.commit('setAudioStatus', { id, status: FILE_STATUS.processing });
        },

        // ── Video actions ────────────────────────────────────────────────────
        loadVideoWorker(context) {
            if (context.state.videoWorker) return;
            const worker = new VideoWorker();
            context.state.videoWorker = worker;
            worker.postMessage({ action: 'load' });
            worker.onmessage = (e) => {
                const { status, id } = e.data;
                let processMore = false;
                if (status === 'progress') {
                    context.commit('setVideoProgress', { id, progress: e.data.progress });
                } else if (status === 'processed') {
                    context.commit('setVideoProgress', { id, progress: 100 });
                    context.commit('setVideoStatus', { id, status: FILE_STATUS.processed });
                    context.commit('setVideoData', { id, data: e.data });
                    processMore = true;
                } else if (status === 'failed') {
                    context.commit('setVideoStatus', { id, status: FILE_STATUS.failed });
                    processMore = true;
                }
                if (processMore) context.dispatch('processAllWaitingVideo');
            };
        },
        clearVideoFiles(context) {
            context.commit('clearVideoFiles');
        },
        setVideoFormat(context, format) {
            context.commit('setVideoFormat', format);
        },
        addVideoFile(context, file) {
            const fileObject = {
                id: context.state.videoNextIndex,
                ogFile: file,
                name: file.name,
                status: FILE_STATUS.initialized,
                progress: 0,
                output: { blob: null, name: null, url: null, config: null },
                process: [],
            };
            context.commit('incrementVideoId');
            context.commit('addVideoFile', fileObject);
        },
        async addVideoFiles(context, files) {
            for (let i = 0; i < files.length; i++) {
                context.dispatch('addVideoFile', files[i]);
                await new Promise(r => setTimeout(r, 16));
            }
        },
        processAllVideoFiles(context) {
            const notProcessed = context.state.videoFiles.filter(
                f => f.status === FILE_STATUS.initialized
            );
            notProcessed.forEach(f => {
                context.commit('setVideoStatus', { id: f.id, status: FILE_STATUS.waiting });
            });
            context.dispatch('processAllWaitingVideo');
        },
        processAllWaitingVideo(context) {
            const running = context.state.videoFiles.filter(
                f => f.status === FILE_STATUS.processing
            ).length;
            const concurrency = navigator.hardwareConcurrency || 1;
            const maxInFlight = Math.min(1, concurrency);
            for (let i = 0; i < maxInFlight - running; i++) {
                const waiting = context.state.videoFiles.find(f => f.status === FILE_STATUS.waiting);
                if (!waiting) break;
                context.dispatch('processVideoFile', waiting.id);
            }
        },
        processVideoFile(context, id) {
            const file = context.state.videoFiles.find(f => f.id === id);
            const config = clone(context.state.videoConfig);
            context.state.videoWorker.postMessage({
                action: 'process',
                file: file.ogFile,
                id: file.id,
                config,
            });
            context.commit('setVideoProgress', { id, progress: 0 });
            context.commit('setVideoStatus', { id, status: FILE_STATUS.processing });
        },

        // ── Document actions ─────────────────────────────────────────────────
        loadDocumentWorker(context) {
            if (context.state.documentWorker) return;
            const worker = new DocWorker();
            context.state.documentWorker = worker;
            worker.postMessage({ action: 'load' });
            worker.onmessage = (e) => {
                const { status, id } = e.data;
                let processMore = false;
                if (status === 'progress') {
                    context.commit('setDocumentProgress', { id, progress: e.data.progress });
                } else if (status === 'processed') {
                    context.commit('setDocumentProgress', { id, progress: 100 });
                    context.commit('setDocumentStatus', { id, status: FILE_STATUS.processed });
                    context.commit('setDocumentData', { id, data: e.data });
                    processMore = true;
                } else if (status === 'failed') {
                    context.commit('setDocumentStatus', { id, status: FILE_STATUS.failed });
                    processMore = true;
                }
                if (processMore) context.dispatch('processAllWaitingDocument');
            };
        },
        clearDocumentFiles(context) {
            context.commit('clearDocumentFiles');
        },
        setDocumentFormat(context, format) {
            context.commit('setDocumentFormat', format);
        },
        setDocumentInputFormat(context, format) {
            context.commit('setDocumentInputFormat', format);
        },
        addDocumentFile(context, file) {
            const fileObject = {
                id: context.state.documentNextIndex,
                ogFile: file,
                name: file.name,
                status: FILE_STATUS.initialized,
                progress: 0,
                output: { blob: null, name: null, url: null, config: null },
                process: [],
            };
            context.commit('incrementDocumentId');
            context.commit('addDocumentFile', fileObject);
        },
        async addDocumentFiles(context, files) {
            for (let i = 0; i < files.length; i++) {
                context.dispatch('addDocumentFile', files[i]);
                await new Promise(r => setTimeout(r, 16));
            }
        },
        processAllDocumentFiles(context) {
            const notProcessed = context.state.documentFiles.filter(
                f => f.status === FILE_STATUS.initialized
            );
            notProcessed.forEach(f => {
                context.commit('setDocumentStatus', { id: f.id, status: FILE_STATUS.waiting });
            });
            context.dispatch('processAllWaitingDocument');
        },
        processAllWaitingDocument(context) {
            const running = context.state.documentFiles.filter(
                f => f.status === FILE_STATUS.processing
            ).length;
            const maxInFlight = 1; // pandoc WASM is single-threaded
            for (let i = 0; i < maxInFlight - running; i++) {
                const waiting = context.state.documentFiles.find(f => f.status === FILE_STATUS.waiting);
                if (!waiting) break;
                context.dispatch('processDocumentFile', waiting.id);
            }
        },
        processDocumentFile(context, id) {
            const file = context.state.documentFiles.find(f => f.id === id);
            const config = clone(context.state.documentConfig);
            context.state.documentWorker.postMessage({
                action: 'process',
                file: file.ogFile,
                id: file.id,
                config,
            });
            context.commit('setDocumentProgress', { id, progress: 0 });
            context.commit('setDocumentStatus', { id, status: FILE_STATUS.processing });
        },

        // ── Archive actions ──────────────────────────────────────────────────
        loadArchiveWorker(context) {
            if (context.state.archiveWorker) return;
            const worker = new ArchiveWorker();
            context.state.archiveWorker = worker;
            worker.postMessage({ action: 'load' });
            worker.onmessage = (e) => {
                const { status, id } = e.data;
                let processMore = false;
                if (status === 'progress') {
                    context.commit('setArchiveProgress', { id, progress: e.data.progress });
                } else if (status === 'processed') {
                    context.commit('setArchiveProgress', { id, progress: 100 });
                    context.commit('setArchiveStatus', { id, status: FILE_STATUS.processed });
                    context.commit('setArchiveData', { id, data: e.data });
                    processMore = true;
                } else if (status === 'failed') {
                    context.commit('setArchiveStatus', { id, status: FILE_STATUS.failed });
                    processMore = true;
                }
                if (processMore) context.dispatch('processAllWaitingArchive');
            };
        },
        clearArchiveFiles(context) {
            context.commit('clearArchiveFiles');
        },
        setArchiveFormat(context, format) {
            context.commit('setArchiveFormat', format);
        },
        setArchiveInputFormat(context, format) {
            context.commit('setArchiveInputFormat', format);
        },
        addArchiveFile(context, file) {
            const fileObject = {
                id: context.state.archiveNextIndex,
                ogFile: file,
                name: file.name,
                status: FILE_STATUS.initialized,
                progress: 0,
                output: { blob: null, name: null, url: null, config: null },
                process: [],
            };
            context.commit('incrementArchiveId');
            context.commit('addArchiveFile', fileObject);
        },
        async addArchiveFiles(context, files) {
            for (let i = 0; i < files.length; i++) {
                context.dispatch('addArchiveFile', files[i]);
                await new Promise(r => setTimeout(r, 16));
            }
        },
        processAllArchiveFiles(context) {
            const notProcessed = context.state.archiveFiles.filter(
                f => f.status === FILE_STATUS.initialized
            );
            notProcessed.forEach(f => {
                context.commit('setArchiveStatus', { id: f.id, status: FILE_STATUS.waiting });
            });
            context.dispatch('processAllWaitingArchive');
        },
        processAllWaitingArchive(context) {
            const running = context.state.archiveFiles.filter(
                f => f.status === FILE_STATUS.processing
            ).length;
            const maxInFlight = 1;
            for (let i = 0; i < maxInFlight - running; i++) {
                const waiting = context.state.archiveFiles.find(f => f.status === FILE_STATUS.waiting);
                if (!waiting) break;
                context.dispatch('processArchiveFile', waiting.id);
            }
        },
        processArchiveFile(context, id) {
            const file = context.state.archiveFiles.find(f => f.id === id);
            const config = clone(context.state.archiveConfig);
            context.state.archiveWorker.postMessage({
                action: 'process',
                file: file.ogFile,
                id: file.id,
                config,
            });
            context.commit('setArchiveProgress', { id, progress: 0 });
            context.commit('setArchiveStatus', { id, status: FILE_STATUS.processing });
        },

        // ── Font actions ─────────────────────────────────────────────────────
        loadFontWorker(context) {
            if (context.state.fontWorker) return;
            const worker = new FontWorker();
            context.state.fontWorker = worker;
            worker.postMessage({ action: 'load' });
            worker.onmessage = (e) => {
                const { status, id } = e.data;
                let processMore = false;
                if (status === 'progress') {
                    context.commit('setFontProgress', { id, progress: e.data.progress });
                } else if (status === 'processed') {
                    context.commit('setFontProgress', { id, progress: 100 });
                    context.commit('setFontStatus', { id, status: FILE_STATUS.processed });
                    context.commit('setFontData', { id, data: e.data });
                    processMore = true;
                } else if (status === 'failed') {
                    context.commit('setFontStatus', { id, status: FILE_STATUS.failed });
                    processMore = true;
                }
                if (processMore) context.dispatch('processAllWaitingFont');
            };
        },
        clearFontFiles(context) {
            context.commit('clearFontFiles');
        },
        setFontFormat(context, format) {
            context.commit('setFontFormat', format);
        },
        setFontInputFormat(context, format) {
            context.commit('setFontInputFormat', format);
        },
        addFontFile(context, file) {
            const fileObject = {
                id: context.state.fontNextIndex,
                ogFile: file,
                name: file.name,
                status: FILE_STATUS.initialized,
                progress: 0,
                output: { blob: null, name: null, url: null, config: null },
                process: [],
            };
            context.commit('incrementFontId');
            context.commit('addFontFile', fileObject);
        },
        async addFontFiles(context, files) {
            for (let i = 0; i < files.length; i++) {
                context.dispatch('addFontFile', files[i]);
                await new Promise(r => setTimeout(r, 16));
            }
        },
        processAllFontFiles(context) {
            const notProcessed = context.state.fontFiles.filter(
                f => f.status === FILE_STATUS.initialized
            );
            notProcessed.forEach(f => {
                context.commit('setFontStatus', { id: f.id, status: FILE_STATUS.waiting });
            });
            context.dispatch('processAllWaitingFont');
        },
        processAllWaitingFont(context) {
            const running = context.state.fontFiles.filter(
                f => f.status === FILE_STATUS.processing
            ).length;
            const maxInFlight = 1;
            for (let i = 0; i < maxInFlight - running; i++) {
                const waiting = context.state.fontFiles.find(f => f.status === FILE_STATUS.waiting);
                if (!waiting) break;
                context.dispatch('processFontFile', waiting.id);
            }
        },
        processFontFile(context, id) {
            const file = context.state.fontFiles.find(f => f.id === id);
            const config = clone(context.state.fontConfig);
            context.state.fontWorker.postMessage({
                action: 'process',
                file: file.ogFile,
                id: file.id,
                config,
            });
            context.commit('setFontProgress', { id, progress: 0 });
            context.commit('setFontStatus', { id, status: FILE_STATUS.processing });
        },
    },
    modules: {
    }
})

function clone(object) {
    return JSON.parse(JSON.stringify(object));
}
