import type {NextPage} from 'next'
import React, {useEffect, useState} from "react";
import {BsCart2} from "react-icons/bs";
import {FaGreaterThan, FaLessThan} from "react-icons/fa";
import {BiSort} from "react-icons/bi";
import axios from "axios";
import Head from 'next/head'
import Image from 'next/image'

const Home: NextPage = () => {
  type Image = {
    src: string,
    alt: string
  };
  type Dimensions = {
    width: number,
    height: number
  };
  type Recommendations = {
    src: string,
    alt: string
  };
  type Details = {
    dimmentions: Dimensions,
    description?: string,
    size?: number,
    recommendations?: Recommendations[]
  };

  type Products = {
    name: string,
    category: string,
    price: number,
    currency: string,
    bestseller: boolean,
    featured: boolean,
    image: Image,
    details: Details | null
  }

  type Data = {
    data: {
      products: Products[]
    }
  }

  const [products, setProducts] = useState<Products[]>([]);
  const [productsBackUp, setProductsBackUp] = useState<Products[]>([]);
  const [featured, setFeatured] = useState<Products[]>();
  const [hoveredOn, setHoveredOn] = useState<number>();
  const [page, setPage] = useState<number>(1);
  const [toShow, setToShow] = useState<Products[]>([]);
  const [cart, setCart] = useState<Products[]>([]);
  const [showCart, setShowCart] = useState<boolean>(false);
  const [sortDirection, setSortDirection] = useState<string>('up');
  const [formData, setFormData] = useState({sorter: 'alphabet', priceRange: ''});
  const [checkBoxes, setCheckBoxes] = useState<string[]>([]);

  const hover = (id: number) => {
    setHoveredOn(id);
  }

  const onChangeCheckBoxes = (e: React.FormEvent<HTMLInputElement>) => {
    const temp = [...checkBoxes];
    // @ts-ignore
    const { value } = e.target;
    const position = temp.indexOf(value);
    if (position !== -1) {
      temp.splice(position, 1);
      setCheckBoxes(temp);
    } else {
      setCheckBoxes([...checkBoxes, value])
    }
  }

  const addToCart = (product: Products) => {
    setCart([...cart, product]);
    setShowCart(true);
  }

  const seeHideCart = () => {
    setShowCart(!showCart);
  }

  const resetCart = () => {
    setCart([]);
    setShowCart(!showCart);
  }

  const sort = () => {
    if (formData.sorter === 'alphabet' && sortDirection === 'up') {
      sortAlphabetically('down');
      setSortDirection('down');
    }
    if (formData.sorter === 'price' && sortDirection === 'up') {
      sortByPrice('down');
      setSortDirection('down');
    }
    if (formData.sorter === 'alphabet' && sortDirection === 'down') {
      sortAlphabetically('up');
      setSortDirection('up');
    }
    if (formData.sorter === 'price' && sortDirection === 'down') {
      sortByPrice('up');
      setSortDirection('up');
    }
  }

  const sortByPrice = (type: string) => {
    const temp = type === 'up' ? products.sort((a, b) => a.price - b.price) :
      products.sort((a, b) => b.price - a.price) ;
    setProducts(temp);
    setItemsToShow();
  }

  const sortAlphabetically = (type: string) => {
    const temp = type === 'up' ? products.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      } else {
        return 1;
      }
    }) : products.sort((a, b) => {
      if (b.name < a.name) {
        return -1;
      } else {
        return 1;
      }
    })
    setProducts(temp);
    setItemsToShow();
  }

  const onChange = (e: any) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  }

  const setItemsToShow = () => {
    const last = page * 5;
    const first = last - 5;
    const items = products.filter((a, i) => i <= last && i >= first);
    setToShow(items);
  }

  const setPagination = (type: string) => {
    if (type === 'add' && !(page * 5 > products.length)) {
      const newPage = page + 1;
      setPage(newPage);
    }
    if (type === 'remove' && !(page < 2)) {
      const newPage = page - 1;
      setPage(newPage);
    }
  }

  const getData: () => Promise<void> = async () => {
    const data: Data = await axios.get('http://localhost:5000/');
    setProducts(data.data.products.filter(a => !a.featured));
    setProductsBackUp(data.data.products.filter(a => !a.featured));
    setFeatured(data.data.products.filter(a => a.featured));
    setItemsToShow();
  }

  const filterItems = () => {
    const temp1 = checkBoxes.length > 0 ? productsBackUp.filter((a) => checkBoxes.includes(a.category)) : productsBackUp;
    let temp2: Products[];
    if (formData.priceRange === '<20') {
      temp2 = temp1.filter(a => a.price < 20);
    } else if (formData.priceRange === '>20&<100') {
      temp2 = temp1.filter(a => a.price >= 20 && a.price <= 100);
    } else if (formData.priceRange === '>100&<200') {
      temp2 = temp1.filter(a => a.price >= 100 && a.price <= 200);
    } else if (formData.priceRange === '>200') {
      temp2 = temp1.filter(a => a.price > 200);
    } else {
      temp2 = temp1;
    }
    setPage(1);
    setProducts(temp2);
  }

  useEffect(() => {
    getData().then(r => r);
  }, []);

  useEffect(() => setItemsToShow(), [products, page]);

  useEffect(() => sort(), [formData])

  useEffect(() => filterItems(), [formData.priceRange, checkBoxes])

  return (
    <div className='container'>
      <Head>
        <title>Bejamas App</title>
        <meta name="description" content="Generated by create next app"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>

      <header>
        <div className='row my-2'>
          <div className='col text-start' style={{fontSize: '4vh'}}><strong>BEJAMAS_</strong></div>
          <div className='col text-end' style={{fontSize: '4vh', position: 'relative', cursor: 'pointer'}}>
            <div onClick={seeHideCart}>
              <BsCart2 style={{position: 'relative'}}></BsCart2><span
              style={{fontSize: '2vh', position: 'absolute'}}>{cart.length}</span>
            </div>
            <div className='border border-secondary' style={{
              position: 'absolute',
              width: 'inherit',
              height: '50vh',
              zIndex: '100',
              backgroundColor: 'white',
              visibility: showCart ? 'visible': 'hidden'
            }}>
              <div className='mx-2' style={{cursor: 'pointer'}} onClick={seeHideCart}>x</div>
              <div style={{overflowY: 'scroll', height: '35vh'}}>
                {cart.map((a, i) => (
                  <div className='row my-4' key={i} style={{height: '100px', width: '100%'}}>
                    <div className='col text-start mx-2' style={{fontSize: '2vh'}}>
                      <div>{a.name}</div>
                      <div>${a.price}</div>
                    </div>
                    <div className='col' style={{width: '5rem', height: 'inherit'}}>
                      <Image src={a.image.src} alt={a.image.alt} height='80px' width='100px' layout='intrinsic'></Image>
                    </div>
                    <hr />
                  </div>
                ))}
              </div>
              <div className='mx-2' onClick={resetCart}>
                {cart.length > 0 && (<button className='btn btn-dark form-control'>CLEAR</button>)}
              </div>
            </div>
          </div>
        </div>
        <hr/>
      </header>

      <main>
        {
          featured?.map((a, i) => (
            <>
              <div className='row' key={i}>
                <div style={{fontSize: '3vh'}} className='col-lg-10 col-sm-12'><strong>{a.name}</strong></div>
                <div className='col-lg-2 col-sm-12 text-end'>
                  <button className='btn btn-dark' onClick={() => addToCart(a)}>ADD TO CART</button>
                </div>
              </div>
              <div className='my-4' style={{display: 'block', position: 'relative'}}>
                <Image layout='responsive' src={a.image.src} alt='' width='200' height='80'></Image>
                <div className='bg-white text-dark text-center'
                     style={{position: 'absolute', bottom: '0px', width: '30%', fontSize: '2vh'}}><strong>Photo of the
                  day</strong></div>
              </div>
              <div className='row'>
                <div className='col-sm-12 col-lg-8'>
                  <div className='my-1'><strong>About the {a.name}</strong></div>
                  <div className='my-1 text-secondary'>
                    <strong>{a.category?.slice(0, 1).toUpperCase()}{a.category?.slice(1)}</strong></div>
                  <div>{a.details?.description}</div>
                </div>
                <div className='col-lg-4 col-sm-12 text-end'>
                  <div className='my-2'><strong>People also buy</strong></div>
                  <div className='row my-2'>{a.details?.recommendations?.map((b, j) => (
                    <div key={j} className='col'>
                      <Image src={b.src} alt={b.alt} layout='responsive' height='3' width='2'></Image>
                    </div>
                  ))}</div>
                  <div className='my-1'><strong>Details</strong></div>
                  <div><>Size: {a.details?.dimmentions.width} * {a.details?.dimmentions.height} pixel</>
                  </div>
                  <div><>Size: {a.details?.size && a.details?.size / 1000} mb</>
                  </div>
                </div>
              </div>
            </>
          ))
        }
        <hr/>
        <div className='d-flex flex-row justify-content-between'>
          <div><strong>Photography /</strong> Premium Photos</div>
          <div className='row mb-3'>
            <div className='col' onClick={sort}><BiSort/>Sort</div>
            <div className='col'>
              <select className='form-select' name='sorter' value={formData.sorter} onChange={onChange}>
                <option value='alphabet'>Alphabetically</option>
                <option value='price'>Price</option>
              </select>
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col-2'>
            <div className='my-2'><strong>Category</strong></div>
            <div className='d-flex flex-column'>
              <div className='form-group m-1'><input type='checkbox' value='people' name='people' onChange={onChangeCheckBoxes} checked={checkBoxes.includes('people')}/>People</div>
              <div className='form-group m-1'><input type='checkbox' value='premium' name='premium' onChange={onChangeCheckBoxes} checked={checkBoxes.includes('premium')}/>Premium</div>
              <div className='form-group m-1'><input type='checkbox' value='pets' name='pets' onChange={onChangeCheckBoxes} checked={checkBoxes.includes('pets')}/>Pets</div>
              <div className='form-group m-1'><input type='checkbox' value='food' name='food' onChange={onChangeCheckBoxes} checked={checkBoxes.includes('food')}/>Food</div>
              <div className='form-group m-1'><input type='checkbox' value='landmarks' name='landmarks' onChange={onChangeCheckBoxes} checked={checkBoxes.includes('landmarks')}/>Landmarks</div>
              <div className='form-group m-1'><input type='checkbox' value='cities' name='cities' onChange={onChangeCheckBoxes} checked={checkBoxes.includes('cities')}/>Cities</div>
              <div className='form-group m-1'><input type='checkbox' value='nature' name='nature' onChange={onChangeCheckBoxes} checked={checkBoxes.includes('nature')}/>Nature</div>
            </div>
            <hr/>
            <div className='my-2'><strong>Price Range</strong></div>
            <div className='d-flex flex-column'>
              <div className='form-group m-1'><input type='radio' name='priceRange' value='<20' onChange={onChange} checked={formData.priceRange === '<20'}/>Lower than $20</div>
              <div className='form-group m-1'><input type='radio' name='priceRange' value='>20&<100' onChange={onChange} checked={formData.priceRange === '>20&<100'}/>$20 - $100</div>
              <div className='form-group m-1'><input type='radio' name='priceRange' value='>100&<200' onChange={onChange} checked={formData.priceRange === '>100&<200'}/>$100 - $200</div>
              <div className='form-group m-1'><input type='radio' name='priceRange' value='>200' onChange={onChange} checked={formData.priceRange === '>200'}/>More than $200</div>
            </div>
          </div>
          <div className='col-md-10'>
            <div className='row'>{toShow.map((a, i) => (
              <div className='col-sm-12 col-md-6 col-lg-4 mb-5' key={i}>
                <div style={{position: 'relative', textAlign: 'center'}}>
                  <Image src={a.image.src} alt={a.image.alt} layout='responsive' height='4' width='4'
                         onMouseOver={() => hover(i)}></Image>
                  {a.bestseller && (
                    <div className='bg-white text-dark' style={{position: 'absolute', top: '0px', width: '50%'}}>Best
                      Seller</div>)}
                  <button className='form-control btn-dark'
                          onClick={() => addToCart(a)}
                          style={{
                            position: 'absolute',
                            bottom: '0px',
                            visibility: hoveredOn === i ? 'visible' : 'hidden'
                          }}>
                    ADD TO CART
                  </button>
                </div>
                <div>
                  <div className='text-secondary'>
                    <strong>{a.category?.slice(0, 1).toUpperCase()}{a.category?.slice(1)}</strong></div>
                  <div><strong>{a.name}</strong></div>
                  <div className='text-secondary'>{a.currency === 'USD' && '$'}{a.price}</div>
                </div>
              </div>
            ))}</div>
          </div>
        </div>
      </main>

      <footer className='m-4'>
        <div className='d-flex flex-row justify-content-center'>
          <span style={{cursor: 'pointer', color: page === 1 ? 'gray' : 'black'}}
                onClick={() => setPagination('remove')} className='mx-2'><FaLessThan/></span>
          <span>{page}</span>
          <span style={{cursor: 'pointer', color: page * 5 >= products.length ? 'gray' : 'black'}}
                onClick={() => setPagination('add')} className='mx-2'><FaGreaterThan/></span>
        </div>
      </footer>

    </div>
  )
}

export default Home
