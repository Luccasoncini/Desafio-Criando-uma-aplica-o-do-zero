import { GetStaticProps } from 'next';
import Head from 'next/head'

import { useEffect, useState } from 'react';
import { FiCalendar, FiUser} from 'react-icons/fi'

import Header from '../components/Header';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';
import Link from 'next/link';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {

  const StaticPosts = postsPagination.results.map(post => {
    return{
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        "dd' 'MMM' 'yyyy",
        {
          locale: ptBR,
        }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  })

  const [postsContent, setPostsContent] = useState(StaticPosts)
  const [nextPage, setNextPage] = useState(postsPagination.next_page)
  const [currentPage, setCurrentPage] = useState(1)
  const [buttonHide, setButtonHide] = useState(false)

  useEffect(() => {
    if(nextPage == null) {
      setButtonHide(true)
    }
  }, [nextPage]);

  async function handleNextPage(): Promise<void> {
    if (currentPage != 1 && nextPage == null) {
      return;
    }

    var postsResults = await fetch(`${nextPage}`).then(response =>
      response.json()  
    );

    setNextPage(postsResults.next_page)
    setCurrentPage(postsResults.page)

    const newPosts = postsResults.results.map(post => {
      return{
        slug: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          "dd' 'MMM' 'yyyy",
          {
            locale: ptBR,
          }
        ),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author
        }
      }
    })

    setPostsContent([...postsContent, ...newPosts])
  } 

  return(
    <>
      <Head>
          <title>Posts | SpaceTraveling</title>
      </Head>

      <main className={styles.main_container}>
        <Header />
      
        <div className={styles.list_posts}>
          {postsContent.map(post => {
            return(
                <Link href={`/post/${post.uid}`}>
                  <a href={`/post/${post.uid}`} className={styles.post} key={post.uid}>
                    <strong>{post.data.title}</strong>
                    <span>{post.data.subtitle}</span>

                    <div className={styles.bottom_post}>
                      <data><FiCalendar size="20"/> {post.first_publication_date}</data>
                      <span><FiUser size="20"/> {post.data.author}</span>
                    </div>
                  </a>
                </Link>
            )
          })}

          {buttonHide ? '' : ( <a href="javascript:void(0)" onClick={handleNextPage}> Carregar mais posts</a>)}

        </div>
      </main>
    </>

  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});

  const postsResponse = await prismic.getByType('posts',{
    pageSize: 1
  });

  const posts = postsResponse.results.map(post => {
    return{
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author
        }
    }
  })

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  }

  return{
    props: {
      postsPagination,
    }
  }
};
