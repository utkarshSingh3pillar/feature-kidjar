import { BadRequestException } from '@nestjs/common';
export const imageFileFilter = (req, image, callback) => {
      if (!image.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return callback(new BadRequestException(
                  {
                        message: 'File format not supported. You can only upload .jpeg or .png files.',
                        description: 'Failed to upload the file.'
                  }), false);
      }
      callback(null, true);
};

export const maxFileSize = 4 * 1024 * 1024; //4 MB