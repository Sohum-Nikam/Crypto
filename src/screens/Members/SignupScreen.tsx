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
      
      // Show success message and redirect to sign-in after successful registration
      setError('Account created');
      setTimeout(() => {
        navigate('/members/signin');
      }, 1500);
    } catch (err: any) {
      const errorMessage = err.message || 'Registration failed';
      if (errorMessage.includes('User already signed in')) {
        setError(errorMessage);
        setTimeout(() => {
          navigate('/members/signin');
        }, 2000);
      } else {
        setError(errorMessage);
      }
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
                    style={{ width: '80px', height: '80px', marginBottom: '15px' }}
                  />
                </div>
                <h1 className='form-title center' style={{ fontSize: '24px', fontWeight: '600', marginBottom: '10px' }}>Create Account</h1>
                <p className='form-desc center' style={{ marginBottom: '30px', color: '#666' }}>
                  Join our secure crypto exchange platform
                </p>
                <form noValidate className='form' onSubmit={handleSubmit}>
                  <div className='form-elements'>
                    <div className='form-grid' style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px'}}>
                      <div className='form-column' style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                        <div className='form-line'>
                          <label htmlFor='name'>First Name</label>
                          <FormInput
                            type='text'
                            name='name'
                            onChange={handleChange}
                            value={formValues.name}
                            placeholder='Enter your first name'
                          />
                        </div>
                        <div className='form-line'>
                          <label htmlFor='email'>Email Address</label>
                          <FormInput
                            type='email'
                            name='email'
                            onKeyDown={onlyEmail}
                            onChange={handleChange}
                            value={formValues.email}
                            placeholder='Enter your email address'
                          />
                        </div>
                        <div className='form-line'>
                          <label htmlFor='password'>Password</label>
                          <FormInput
                            type='password'
                            name='password'
                            onChange={handleChange}
                            value={formValues.password}
                            placeholder='Create a strong password'
                          />
                        </div>
                      </div>
                      <div className='form-column' style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                        <div className='form-line'>
                          <label htmlFor='lastname'>Last Name</label>
                          <FormInput
                            type='text'
                            name='lastname'
                            onChange={handleChange}
                            value={formValues.lastname}
                            placeholder='Enter your last name'
                          />
                        </div>
                        <div className='form-line'>
                          <label htmlFor='phone'>Phone Number</label>
                          <div className='phone-input-group' style={{display: 'flex', gap: '10px'}}>
                            <select name='country' id='country' className='country-code' style={{width: '100px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff'}} value={formValues.country} onChange={(e) => setFormValues({...formValues, country: e.target.value})}>
                              <option value='+1'>🇺🇸 +1</option>
                              <option value='+44'>🇬🇧 +44</option>
                              <option value='+91'>🇮🇳 +91</option>
                              <option value='+49'>🇩🇪 +49</option>
                              <option value='+81'>🇯🇵 +81</option>
                              <option value='+33'>🇫🇷 +33</option>
                              <option value='+86'>🇨🇳 +86</option>
                              <option value='+7'>🇷🇺 +7</option>
                              <option value='+55'>🇧🇷 +55</option>
                              <option value='+61'>🇦🇺 +61</option>
                            </select>
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
                          <label htmlFor='password1'>Confirm Password</label>
                          <FormInput
                            type='password'
                            name='password1'
                            onChange={handleChange}
                            value={formValues.password1}
                            placeholder='Re-enter your password'
                          />
                        </div>
                      </div>
                    </div>

                    <div className='form-line'>
                      <div className='full-width'>
                        <FormCheckbox
                          name='agreeToPolicies1'
                          onChange={handleCheckboxChange}
                          checked={formValues.agreeToPolicies1}
                          text={`I agree to the Terms of Service and Privacy Policy`}
                        />
                      </div>
                    </div>
                    
                    <div className='form-line'>
                      {error && (
                        <div className='error-message' style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>
                          {error}
                        </div>
                      )}
                      <div className='buttons'>
                        <FormButton text={loading ? 'Creating Account...' : 'Create Account'} disabled={loading} />
                      </div>
                    </div>
                    
                    <div className='form-line'>
                      <div className='center'>
                        <p style={{ margin: '15px 0 0 0', color: '#666' }}>
                          Already have an account? <Link to='/members/signin' style={{ color: '#007bff', textDecoration: 'none', fontWeight: '500' }}>Sign in</Link>
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
