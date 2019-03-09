import React from 'react';
import { SlateEditor as Component } from '../components/SlateEditor';
import { Story } from '../../../types';

interface Props {
  story: Story;
  onChangeStoryField: (field: string, value: any) => void;
}

export const SlateEditor = ({ story, onChangeStoryField }: Props) => {
  const handleChangeTitle = (title: string) => {
    onChangeStoryField('title', title);
  };

  return (
    <Component
      story={story}
      onChangeTitle={handleChangeTitle}
      onChangeStoryField={onChangeStoryField}
    />
  );
};
