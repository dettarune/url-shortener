import { HttpStatus } from '@nestjs/common';
import { CustomErrorFilters } from 'src/error/custom-exception';

interface CheckConflictOptions {
  user: { username: string; email: string };
  req: { username: string; email: string };
}

export function checkAuthConflict( user, req ) {
  const isUsernameTaken = user.username === req.username;
  const isEmailTaken = user.email === req.email;

  if (isUsernameTaken && isEmailTaken) {
    throw new CustomErrorFilters({
      statusCode: HttpStatus.CONFLICT,
      message: 'Username and Email are already registered',
      suggestion: 'Please choose a different username and email.'
    });
  }

  if (isUsernameTaken) {
    throw new CustomErrorFilters({
      statusCode: HttpStatus.CONFLICT,
      message: 'Username is already registered',
      suggestion: 'Try a different username'
    });
  }

  if (isEmailTaken) {
    throw new CustomErrorFilters({
      statusCode: HttpStatus.CONFLICT,
      message: 'Email is already registered',
      suggestion: 'Try a different email'
    });
  }
}
