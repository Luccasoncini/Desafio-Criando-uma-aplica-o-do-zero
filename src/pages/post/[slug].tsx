import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';

import Head from 'next/head';
import Header from '../../components/Header';

import { FiCalendar, FiUser, FiClock} from 'react-icons/fi'

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post} : PostProps) {

  const router = useRouter();

  if(router.isFallback) {
    return <h1>Carregando...</h1>
  }

  const formattedData = format(new Date(post.first_publication_date), "dd' 'MMM' 'yyyy",{locale: ptBR,})
  
  return(
    <>
      <Head>
          <title>{`${post.data.title} | SpaceTraveling`}</title>
      </Head>

      <main>
        <Header />

        <div className={styles.container}>
          <img src={post.data.banner.url} />
          
          <div className={styles.content}>
            <h1>{post.data.title}</h1>

            <div className={styles.bottom_title}>
              <data><FiCalendar size="20"/> {formattedData}</data>
              <span><FiUser size="20" /> {post.data.author}</span>
              <time><FiClock size="20" /> 4 min</time>
            </div>

            {post.data.content.map((content, key) => {
              return(
                <div key={key} className={styles.postContent}>
                    <h2>{content.heading}</h2>
                    <div
                      className={styles.paragraphContent}
                      dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body)}}
                    >
                    </div>
                </div>
              )
            })}
          </div>
        </div>  
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});

  const posts = await prismic.getAllByType('posts');

  const paths = posts.map(post => {
    return{
      params: {
        slug: post.uid
      },
    };
  });

  return{
    paths,
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async context => {
  

  const prismic = getPrismicClient({});

  const { slug } = context.params;

  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
    uid: response.uid,
    data: {
      subtitle: response.data.subtitle,
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return{
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  return {
    props: {
      post,
    }
  };
};
