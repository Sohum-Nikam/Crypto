import { useState } from 'react';

import { Link } from 'react-router-dom';

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
}

const ForgotScreen: React.FC = () => {
  const { forgotPassword } = useAuth();

  const [formValues, setFormValues] = useState<IFormProps>({  
    email: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  /**
   * Handles input changes in the forgot password form.
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
   * Handles the form submission for the forgot password screen.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   * @returns {void}
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      await forgotPassword(formValues.email);
      setSuccessMessage('Password reset link sent to your email. Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
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
                <h1 className='form-title center'>Password reset</h1>
                <p className='form-desc center'>
                  Please enter your registered phone number. We will send you the password reset
                  information.
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
                      <div className='full-width right'>
                        <Link to='/'>Sign in</Link>
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
                        <FormButton text={loading ? 'Sending...' : 'Send'} disabled={loading} />
                      </div>
                    </div>
                    <div className='form-line'>
                      <div className='center'>
                        <p>
                          If you don't have an account, create a{' '}
                          <Link to='/members/signup'>new account</Link>.
                        </p>
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

export default ForgotScreen;
