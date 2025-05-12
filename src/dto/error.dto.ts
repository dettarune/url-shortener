import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Status of the response',
    example: 'error',
  })
  status: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 404,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message explaining what went wrong',
    example: 'The requested resource was not found.',
  })
  message: string;

  @ApiProperty({
    description: 'Request path that caused the error',
    example: '/api/v1/users/12345',
  })
  path?: string;

  @ApiProperty({
    description: 'Suggested fix or reference for the error',
    example: 'Please check if the user ID is correct or refer to our documentation.',
  })
  suggestion?: string;

  @ApiProperty({
    description: 'URL to the error documentation',
    example: 'https://api.example.com/docs/errors#RESOURCE_NOT_FOUND',
  })
  documentation_url?: string;

  @ApiProperty({
    description: 'Timestamp when the error occurred',
    example: '2023-12-08T12:30:45Z',
  })
  timestamp: string;
}
