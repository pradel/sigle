import React from 'react';
import styled, { css } from 'styled-components/macro';
import tw from 'tailwind.macro';
import { MdClose } from 'react-icons/md';
import { ButtonOutline } from '../../../components';
import { Story } from '../../../types';

const containerSize = 450;

const Container = styled.div<{ open: boolean }>`
  ${tw`absolute pin-r pin-t pin-b bg-grey-lightest z-10 px-8 pb-8`};
  width: ${containerSize}px;
  max-width: 100%;
  transition: transform 0.3s ease;
  transform: translate3d(${containerSize}px, 0, 0);

  ${props =>
    props.open &&
    css`
      transform: translateZ(0);
    `}
`;

const TitleContainer = styled.div`
  ${tw`py-4 flex justify-between items-center`};
`;

const Title = styled.div`
  ${tw`text-2xl`};
  font-family: 'Libre Baskerville', serif;
`;

const CloseButton = styled.div`
  ${tw`p-2 -mr-2 flex items-center cursor-pointer`};
`;

const ImageEmpty = styled.div`
  ${tw`flex items-center justify-center bg-white py-16 mb-4 cursor-pointer`};
`;

const Image = styled.img`
  ${tw`mb-4`};
  max-width: 100%;
`;

interface Props {
  story: Story;
  open: boolean;
  onClose: () => void;
  loadingDelete: boolean;
  onDelete: () => void;
  onUploadImage: () => void;
}

export const StorySettings = ({
  open,
  onClose,
  story,
  loadingDelete,
  onDelete,
  onUploadImage,
}: Props) => {
  console.log(story);
  return (
    <Container open={open}>
      <TitleContainer>
        <Title>Settings</Title>
        <CloseButton onClick={onClose}>
          <MdClose />
        </CloseButton>
      </TitleContainer>

      {!story.coverImage && (
        <ImageEmpty onClick={onUploadImage}>Upload story image</ImageEmpty>
      )}
      {story.coverImage && <Image src={story.coverImage} />}

      {loadingDelete && <ButtonOutline disabled>Deleting ...</ButtonOutline>}
      {!loadingDelete && (
        <ButtonOutline onClick={onDelete}>Delete</ButtonOutline>
      )}
    </Container>
  );
};
