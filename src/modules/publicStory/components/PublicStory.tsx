import React, { useEffect, useState } from 'react';
import * as blockstack from 'blockstack';
import { RouteComponentProps } from 'react-router';
import styled from 'styled-components/macro';
import tw from 'tailwind.macro';
import { Value } from 'slate';
import Html from 'slate-html-serializer';
import dompurify from 'dompurify';
import { toast } from 'react-toastify';
import { Story } from '../../../types';
import { Container } from '../../../components';

const rules = [
  {
    serialize(obj: any, children: any) {
      if (obj.object == 'block') {
        switch (obj.type) {
          case 'paragraph':
            return <p className={obj.data.get('className')}>{children}</p>;
          case 'block-quote':
            return <blockquote>{children}</blockquote>;
          case 'image':
            const src = obj.data.get('src');
            return <img src={src} />;
          case 'list-item':
            return <li>{children}</li>;
          case 'numbered-list':
            return <ol>{children}</ol>;
          case 'bulleted-list':
            return <ul>{children}</ul>;
        }
      }
    },
  },
  {
    serialize(obj: any, children: any) {
      if (obj.object == 'mark') {
        switch (obj.type) {
          case 'bold':
            return <strong>{children}</strong>;
          case 'italic':
            return <em>{children}</em>;
          case 'underlined':
            return <u>{children}</u>;
        }
      }
    },
  },
  {
    serialize(obj: any, children: any) {
      if (obj.object == 'inline') {
        switch (obj.type) {
          case 'link':
            const href = obj.data.get('href');
            return <a href={href}>{children}</a>;
        }
      }
    },
  },
];

const html = new Html({ rules });

const Title = styled.div`
  ${tw`text-2xl mt-16 font-bold`};
`;

export const Content = styled.div`
  ${tw`text-base mt-8 mb-16`};

  p,
  ol,
  ul {
    ${tw`mb-4`};
  }

  img {
    ${tw`mb-4`};
    display: block;
    max-width: 100%;
    max-height: 20em;
  }

  blockquote {
    ${tw`mb-4 bg-grey-lighter py-4 px-4`};
    border-left: 10px solid #ccc;
  }

  li + li {
    ${tw`mt-2`};
  }
`;

type Props = RouteComponentProps<{ username: string; storyId: string }>;

export const PublicStory = ({ match }: Props) => {
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<Story | null>(null);

  const getUserFile = async () => {
    setLoading(true);
    try {
      let fileUrl = await blockstack.getUserAppFileUrl(
        match.params.storyId,
        match.params.username,
        window.location.origin
      );
      if (fileUrl) {
        fileUrl = `${fileUrl}.json`;
        const data = await fetch(fileUrl);
        if (data.status === 200) {
          const json = await data.json();
          setFile(json);
        }
      }
      setLoading(false);
    } catch (error) {
      // If story not found do nothing
      if (error.message === 'Name not found') {
        setLoading(false);
        return;
      }
      console.error(error);
      toast.error(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserFile();
  }, [false]);

  if (loading) {
    return <Container>Loading ...</Container>;
  }

  if (!file) {
    return <Container>File not found</Container>;
  }

  return (
    <Container>
      <Title>{file.title}</Title>
      <Content
        dangerouslySetInnerHTML={{
          __html: dompurify.sanitize(
            html.serialize(Value.fromJSON(file.content))
          ),
        }}
      />
    </Container>
  );
};
