import React, { useState, useCallback } from 'react';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';
import { toast } from 'react-toastify';
import { useFormik, FormikErrors } from 'formik';
import { useDropzone } from 'react-dropzone';
import { MdAddAPhoto, MdDelete } from 'react-icons/md';
import { BlockPicker } from 'react-color';
import { SettingsFile } from '../../types';
import { hexRegex } from '../../utils/regex';
import { userSession } from '../../utils/blockstack';
import { getSettingsFile, saveSettingsFile } from '../../utils';
import { resizeImage } from '../../utils/image';
import { Button } from '../../components';
import {
  FormRow,
  FormLabel,
  FormInput,
  FormTextarea,
  FormHelperError,
  FormHelper,
} from '../../components/Form';
import { colors } from '../../utils/colors';

const StyledFormRow = styled(FormRow)`
  ${tw`xl:w-1/2`};
`;

const FormColor = styled.div<{ color: string }>`
  ${tw`py-3 text-white rounded cursor-pointer relative inline-block text-center`};
  width: 170px;
  ${props =>
    css`
      background-color: ${props.color};
    `}
`;

const ImageEmpty = styled.div<{ haveImage: boolean }>`
  ${tw`flex items-center justify-center bg-grey py-8 mb-4 cursor-pointer rounded-lg relative border border-solid border-grey focus:outline-none`};

  ${props =>
    props.haveImage &&
    css`
      ${tw`py-0 bg-transparent`};
    `}

  span {
    ${tw`py-1 px-2 text-sm text-grey-darker`};
  }
`;

const ImageEmptyIconAdd = styled.div`
  ${tw`absolute bottom-0 right-0 p-2 flex items-center text-grey-dark`};
`;

const ImageEmptyIconDelete = styled.div`
  ${tw`absolute top-0 right-0 p-2 flex items-center text-grey-dark`};
`;

const Image = styled.img`
  ${tw`cursor-pointer`};
`;

interface SettingsFormValues {
  siteName: string;
  siteDescription: string;
  siteColor: string;
  siteLogo: string;
}

interface SettingsFormProps {
  settings: SettingsFile;
  username: string;
}

export const SettingsForm = ({ settings, username }: SettingsFormProps) => {
  const [colorOpen, setColorOpen] = useState(false);
  const [customLogo, setCustomLogo] = useState<
    (Blob & { preview: string; name: string }) | undefined
  >();
  const formik = useFormik<SettingsFormValues>({
    initialValues: {
      siteName: settings.siteName || '',
      siteDescription: settings.siteDescription || '',
      siteColor: settings.siteColor || '',
      siteLogo: settings.siteLogo || '',
    },
    validate: values => {
      const errors: FormikErrors<SettingsFormValues> = {};
      if (values.siteName && values.siteName.length > 50) {
        errors.siteName = 'Name too long';
      }
      if (values.siteDescription && values.siteDescription.length > 350) {
        errors.siteName = 'Description too long';
      }
      if (values.siteColor && !values.siteColor.match(hexRegex)) {
        errors.siteColor = 'Invalid color, only hexadecimal colors are allowed';
      }
      return errors;
    },
    onSubmit: async (values, { setSubmitting }) => {
      const newSettings: SettingsFile = {};
      Object.keys(values).forEach(key => {
        // We replace empty strings by undefined
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        newSettings[key] = values[key] ? values[key] : undefined;
      });

      const settingsFile = await getSettingsFile();

      if (customLogo) {
        const now = new Date().getTime();
        const name = `photos/settings/${now}-${customLogo.name}`;
        const coverImageUrl = await userSession.putFile(
          name,
          customLogo as any,
          {
            encrypt: false,
            contentType: customLogo.type,
          }
        );
        setCustomLogo(undefined);
        newSettings.siteLogo = coverImageUrl;
      }

      await saveSettingsFile({
        ...settingsFile,
        ...newSettings,
      });

      toast.success('Settings saved');
      setSubmitting(false);
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const [mime] = file.type.split('/');
      if (mime !== 'image') {
        return;
      }

      const blob = await resizeImage(file, { maxWidth: 2000 });
      setCustomLogo(
        Object.assign(blob as any, {
          name: file.name,
        })
      );
    }
  }, []);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/jpeg, image/png',
    multiple: false,
  });

  const handleRemoveCover = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    // We stop the event so it does not trigger react-dropzone
    event.stopPropagation();
    setCustomLogo(undefined);
    formik.setFieldValue('siteLogo', '');
  };

  const coverImageUrl = customLogo
    ? customLogo.preview
    : formik.values.siteLogo;

  return (
    <form onSubmit={formik.handleSubmit}>
      <StyledFormRow>
        <FormLabel>Name</FormLabel>
        <FormInput
          name="siteName"
          maxLength={50}
          placeholder={username}
          value={formik.values.siteName}
          onChange={formik.handleChange}
        />
        <FormHelper>
          We will show your Blockstack ID if you leave this input empty
        </FormHelper>
        {formik.errors.siteName && (
          <FormHelperError>{formik.errors.siteName}</FormHelperError>
        )}
      </StyledFormRow>

      <StyledFormRow>
        <FormLabel>Description</FormLabel>
        <FormTextarea
          name="siteDescription"
          rows={3}
          maxLength={350}
          value={formik.values.siteDescription}
          onChange={formik.handleChange}
        />
        {formik.errors.siteDescription && (
          <FormHelperError>{formik.errors.siteDescription}</FormHelperError>
        )}
      </StyledFormRow>

      <StyledFormRow>
        <FormLabel>Primary color</FormLabel>
        <FormColor
          color={formik.values.siteColor || colors.pink}
          onClick={() => setColorOpen(true)}
        >
          {formik.values.siteColor || colors.pink}
          {colorOpen && (
            <div style={{ position: 'absolute', zIndex: 2, top: 52, left: 0 }}>
              <div
                style={{
                  position: 'fixed',
                  top: '0px',
                  right: '0px',
                  bottom: '0px',
                  left: '0px',
                }}
                onClick={e => {
                  e.stopPropagation();
                  setColorOpen(false);
                }}
              />
              <BlockPicker
                color={formik.values.siteColor || colors.pink}
                onChange={newColor =>
                  formik.setFieldValue('siteColor', newColor.hex)
                }
                colors={['#ff576a', '#34c58b', '#e0a315', '#5b15e0', '#949494']}
              />
            </div>
          )}
        </FormColor>
        <FormHelper>
          This will change the color of links on your blog
        </FormHelper>
        {formik.errors.siteColor && (
          <FormHelperError>{formik.errors.siteColor}</FormHelperError>
        )}
      </StyledFormRow>

      <StyledFormRow>
        <FormLabel>Logo or profile picture</FormLabel>
        <ImageEmpty
          {...getRootProps({ tabIndex: undefined })}
          haveImage={!!coverImageUrl}
        >
          {coverImageUrl && (
            <ImageEmptyIconDelete onClick={handleRemoveCover}>
              <MdDelete />
            </ImageEmptyIconDelete>
          )}
          {coverImageUrl && <Image src={coverImageUrl} />}
          {!coverImageUrl && <span>Upload cover image</span>}
          <input {...getInputProps()} />
          <ImageEmptyIconAdd>
            <MdAddAPhoto />
          </ImageEmptyIconAdd>
        </ImageEmpty>
        <FormHelper>
          Resize manually your image to get the result you want
        </FormHelper>
      </StyledFormRow>

      <Button disabled={formik.isSubmitting} type="submit">
        {formik.isSubmitting ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
};
