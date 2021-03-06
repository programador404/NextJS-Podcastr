import { GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';

import {format, parseISO} from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import api from '../services/api';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';

import styles from './home.module.scss';
import { UsePlayer } from '../contexts/PlayerContext';

type IEpisodeProps = {
  id: string,
  title: string,
  members: string,
  published_at: string,
  thumbnail: string,
  description: string,
  url: string,
  file: {
    url: string,
    type: string,
    duration: number,
  },
  publishedAt: string,
  duration: number,
  durationAsString: string
}

type IHomeProps = {
  latestEpisodes: IEpisodeProps[],
  allEpisodes: IEpisodeProps[],
}

export default function Home({ latestEpisodes, allEpisodes }:IHomeProps) {
  const {handlePlayList} = UsePlayer();

  const episodesList = [...latestEpisodes, ...allEpisodes];

  return (
    <div className={styles.homepage}>

      <Head>
        <title>Home | podcastr</title>
      </Head>

      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {latestEpisodes.map((episode, index) => {
            return (
              <li key={episode.id}>
                <Image 
                  height={192} 
                  width={192} 
                  src={episode.thumbnail} 
                  alt={episode.title}
                  objectFit="cover"
                />

                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button type="button" onClick={() => handlePlayList(episodesList, index)}>
                  <img src="/play-green.svg" alt="Tocar episodio" />
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
          <h2>Todos episódios</h2>

          <table cellSpacing={0}>
            <thead>
              <tr>
                <th></th>
                <th>Podcast</th>
                <th>Integrantes</th>
                <th>Data</th>
                <th>Duração</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {allEpisodes.map((episode, index) => {
                return (
                  <tr key={episode.id}>
                    <td style={{ width: 72}}>
                      <Image 
                        height={120}
                        width={120}
                        src={episode.thumbnail}
                        alt={episode.title}
                        objectFit="cover"
                      />
                    </td>
                    <td>
                      <Link href={`/episodes/${episode.id}`}>
                        <a>{episode.title}</a>
                      </Link>
                    </td>
                    <td>{episode.members}</td>
                    <td style={{width: 100}}>{episode.publishedAt}</td>
                    <td>{episode.durationAsString}</td>
                    <td>
                      <button type="button" onClick={() => handlePlayList(episodesList, index + latestEpisodes.length)}>
                        <img src="/play-green.svg" alt="Tocar podcast" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
      </section>

    </div>    
  )
}

export const getStaticProps:GetStaticProps = async (context) => {
  const { data } = await api.get('/episodes', {
    params:{
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  });

  const episodes = data.map((episode: IEpisodeProps) => {
    return{
      ...episode,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', {locale: ptBR}),
      duration: Number(episode.file.duration),
      url: episode.file.url,
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
    };
  })

  const latestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      latestEpisodes,
      allEpisodes
    },
    revalidate: 60 * 60 * 8
  };
}
