import { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

// contexts
import { useAuth } from '../../contexts/AuthContext';

// hooks
import useFormEvents from '../../hooks/useFormEvents';

// components
import Box from '../../components/Common/Box';
import MainLayout from '../../layouts/MainLayout';
import FormInput from '../../components/Forms/FormInput';
import FormButton from '../../components/Forms/FormButton';
import FormCheckbox from '../../components/Forms/FormCheckbox';

// interfaces
interface IFormProps {
  email: string;
  phone: string;
  password: string;
  password1: string;
  name: string;
  lastname: string;
  citizenship: boolean;
  identityType: string;
  identityNumber: string;
  day: string;
  month: string;
  year: string;
  country: string;
  operator: string;
  agreeToPolicies1: boolean;
  agreeToPolicies2: boolean;
  agreeToPolicies3: boolean;
}

const SignupScreen: React.FC = () => {
  const { onlyNumbers, onlyEmail } = useFormEvents();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState<IFormProps>({
    email: '',
    phone: '',
    password: '',
    password1: '',
    name: '',
    lastname: '',
    citizenship: false,
    identityType: '',
    identityNumber: '',
    day: '',
    month: '',
    year: '',
    country: '',
    operator: '',
    agreeToPolicies1: false,
    agreeToPolicies2: false,
    agreeToPolicies3: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handles input changes in the sign-up form.
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
   * Handles checkbox changes in the sign-up form.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The checkbox change event.
   * @returns {void}
   */
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, checked } = e.target;

    setFormValues({
      ...formValues,
      [name]: checked,
    });
  };

  /**
   * Handles the form submission for the sign-up screen.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   * @returns {void}
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (formValues.password !== formValues.password1) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await register({
        name: formValues.name,
        lastname: formValues.lastname,
        email: formValues.email,
        phone: formValues.phone,
        password: formValues.password,
      });
      
      // Redirect to dashboard after successful registration
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className='flex flex-center'>
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
                <h1 className='form-title center'>Sign up</h1>
                <p className='form-desc center'>
                  Please enter the information below. We will send your activation details to your
                  phone number.
                </p>
                <form noValidate className='form' onSubmit={handleSubmit}>
                  <div className='form-elements'>
                    <div className='form-line'>
                      <div className='full-width'>
                        <label htmlFor='email'>Email address</label>
                        <FormInput
                          type='email'
                          name='email'
                          onKeyDown={onlyEmail}
                          onChange={handleChange}
                          value={formValues.email}
                          placeholder='Enter your email address'
                        />
                      </div>
                    </div>
                    <div className='form-line'>
                      <div className='full-width'>
                        <label htmlFor='password'>Password</label>
                        <FormInput
                          type='password'
                          name='password'
                          onChange={handleChange}
                          value={formValues.password}
                          placeholder='Enter your password'
                        />
                      </div>
                    </div>
                    <div className='form-line'>
                      <div className='full-width'>
                        <label htmlFor='password1'>Password confirmation</label>
                        <FormInput
                          type='password'
                          name='password1'
                          onChange={handleChange}
                          value={formValues.password1}
                          placeholder='Re-enter your password'
                        />
                      </div>
                    </div>
                    <div className='form-line'>
                      <div className='full-width'>
                        <label htmlFor='name'>Name</label>
                        <FormInput
                          type='text'
                          name='name'
                          onChange={handleChange}
                          value={formValues.name}
                          placeholder='Enter your name'
                        />
                      </div>
                    </div>
                    <div className='form-line'>
                      <div className='full-width'>
                        <label htmlFor='lastname'>Last name</label>
                        <FormInput
                          type='text'
                          name='lastname'
                          onChange={handleChange}
                          value={formValues.lastname}
                          placeholder='Enter your last name'
                        />
                      </div>
                    </div>

                    <div className='form-line clearfix'>
                      <div className='three-width'>
                        <label htmlFor='day'>Birth date</label>
                        <select name='day' id='day'>
                          <option value='1'>Day</option>
                        </select>
                      </div>
                      <div className='three-width'>
                        <label htmlFor='month'>&nbsp;</label>
                        <select name='month' id='month'>
                          <option value='1'>Month</option>
                        </select>
                      </div>
                      <div className='three-width'>
                        <label htmlFor='year'>&nbsp;</label>
                        <select name='year' id='year'>
                          <option value='1'>Year</option>
                        </select>
                      </div>
                    </div>

                    <div className='form-line clearfix'>
                      <div className='three-width'>
                        <label htmlFor='country'>Phone number</label>
                        <select name='country' id='country'>
                          <option value='1'>Country code</option>
                        </select>
                      </div>
                      <div className='three-width'>
                        <label htmlFor='operator'>&nbsp;</label>
                        <select name='operator' id='operator'>
                          <option value='1'>Operator code</option>
                        </select>
                      </div>
                      <div className='three-width'>
                        <label htmlFor='phone'>&nbsp;</label>
                        <FormInput
                          type='text'
                          name='phone'
                          onKeyDown={onlyNumbers}
                          onChange={handleChange}
                          value={formValues.phone}
                          placeholder='Enter your phone number'
                        />
                      </div>
                    </div>

                    <div className='form-line'>
                      <div className='full-width'>
                        <FormCheckbox
                          name='agreeToPolicies1'
                          onChange={handleCheckboxChange}
                          checked={formValues.agreeToPolicies1}
                          text={`I have read the Privacy Policy and Terms of Use, and I accept the User Agreement.`}
                        />
                      </div>
                    </div>
                    <div className='form-line'>
                      {error && (
                        <div className='error-message' style={{ color: 'red', marginBottom: '10px' }}>
                          {error}
                        </div>
                      )}
                      <div className='buttons'>
                        <FormButton text={loading ? 'Signing up...' : 'Sign up'} disabled={loading} />
                      </div>
                    </div>
                    <div className='form-line'>
                      <div className='center'>
                        <p>
                          Do you have an account? <Link to='/'>Sign in</Link>.
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

export default SignupScreen;
