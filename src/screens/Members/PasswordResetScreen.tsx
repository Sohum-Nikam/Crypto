import { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

// contexts
import { useAuth } from '../../contexts/AuthContext';

// components
import Box from '../../components/Common/Box';
import MainLayout from '../../layouts/MainLayout';
import FormInput from '../../components/Forms/FormInput';
import FormButton from '../../components/Forms/FormButton';

// interfaces
interface IFormProps {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

const PasswordResetScreen: React.FC = () => {
  const navigate = useNavigate();
  const { simplePasswordReset } = useAuth();

  const [formValues, setFormValues] = useState<IFormProps>({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  /**
   * Handles input changes in the password reset form.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   * @returns {void}
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  /**
   * Handles the form submission for the password reset screen.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   * @returns {void}
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formValues.newPassword !== formValues.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formValues.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await simplePasswordReset(formValues.email, formValues.newPassword);
      setSuccessMessage('Password updated successfully');
      
      // Redirect to sign-in page after a brief delay
      setTimeout(() => {
        navigate('/members/signin');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className='flex flex-center full-height'>
        <div className='login no-select'>
          <Box>
            <div className='box-vertical-padding box-horizontal-padding'>
              <div>
                <div className='form-logo center'>
                  <img
                    draggable='false'
                    alt='Crypto Exchange'
                    src={`${process.env.PUBLIC_URL}/images/logo.png`}
                  />
                </div>
                <h1 className='form-title center'>Reset Password</h1>
                <p className='form-desc center'>
                  Enter your email and new password to reset your account.
                </p>
                <form className='form' onSubmit={handleSubmit} noValidate>
                  <div className='form-elements'>
                    <div className='form-line'>
                      <div className='full-width'>
                        <label htmlFor='email'>Email address</label>
                        <FormInput
                          type='email'
                          name='email'
                          onChange={handleChange}
                          value={formValues.email}
                          placeholder='Enter your email address'
                        />
                      </div>
                    </div>
                    <div className='form-line'>
                      <div className='full-width'>
                        <label htmlFor='newPassword'>New password</label>
                        <FormInput
                          type='password'
                          name='newPassword'
                          onChange={handleChange}
                          value={formValues.newPassword}
                          placeholder='Enter your new password'
                        />
                      </div>
                    </div>
                    <div className='form-line'>
                      <div className='full-width'>
                        <label htmlFor='confirmPassword'>Confirm new password</label>
                        <FormInput
                          type='password'
                          name='confirmPassword'
                          onChange={handleChange}
                          value={formValues.confirmPassword}
                          placeholder='Re-enter your new password'
                        />
                      </div>
                    </div>
                    <div className='form-line'>
                      <div className='full-width right'>
                        <Link to='/members/signin'>Back to Sign In</Link>
                      </div>
                    </div>
                    <div className='form-line'>
                      {error && (
                        <div className='error-message' style={{ color: 'red', marginBottom: '10px' }}>
                          {error}
                        </div>
                      )}
                      {successMessage && (
                        <div className='success-message' style={{ color: 'green', marginBottom: '10px' }}>
                          {successMessage}
                        </div>
                      )}
                      <div className='buttons'>
                        <FormButton text={loading ? 'Resetting...' : 'Reset Password'} disabled={loading} />
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </Box>
        </div>
      </div>
    </MainLayout>
  );
};

export default PasswordResetScreen;