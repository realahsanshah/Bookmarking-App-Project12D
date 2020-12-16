import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import * as Yup from 'yup';
import { useQuery, useMutation } from '@apollo/client';
import gql from 'graphql-tag'
import {
    Grid, List, ListItem,
    ListItemText, ListItemSecondaryAction,
    IconButton, Modal, CircularProgress,
    Button, TextField
} from '@material-ui/core';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import CreateOutlinedIcon from '@material-ui/icons/CreateOutlined';
import DeleteIcon from '@material-ui/icons/Delete';



const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            textAlign: 'center',
        },
        parent: {
            textAlign: 'center'
        },
        dataDisplay: {
            backgroundColor: '#eeeeee',
            marginBottom: '10px'
        },
        textField: {
            width: '100%',
            textAlign: 'center',
        },
        paper: {
            position: 'absolute',
            width: 400,
            backgroundColor: theme.palette.background.paper,
            border: '2px solid #000',
            boxShadow: theme.shadows[5],
            padding: theme.spacing(2, 4, 3),
        },
    }),
);


const getWebsites = gql`
{
    websites{
        id
        name
        link
  }
}
`

const addWebsite=gql`
    mutation CreateABookmark($name:String,$link:String){
        addWebsite(name:$name,link:$link){
            id
            name
            link
        }
    }
`

function rand() {
    return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
    const top = 50 + rand();
    const left = 50 + rand();

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    };
}


const schema = Yup.object({
    name: Yup.string()
        .required("Add a Name")
        .min(3, 'Must be greater than or equals to 3 characters'),
    link: Yup.string()
        .matches(
            /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
            'Enter correct url!'
        )
        .required('Please enter website'),
})

export interface WebsitesProps {

}

const Websites: React.SFC<WebsitesProps> = () => {
    const classes = useStyles();
    const { loading, error, data } = useQuery(getWebsites);
    const [addWeb]=useMutation(addWebsite);
    const [name, setName] = React.useState('');
    const [link, setLink] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [currentId, setCurrentId] = React.useState(null);
    const [currentName, setCurrentName] = React.useState(null);
    const [currentLink, setCurrentLink] = React.useState(null);

    const [modalStyle] = React.useState(getModalStyle);


    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <div>
                <div>
                    <Formik
                        initialValues={{ name: name, link: link }}
                        validationSchema={schema}
                        onSubmit={(value, { resetForm }) => {
                            console.log('name', value.name)
                            console.log('link', value.link)

                            addWeb({variables:{name:value.name,link:value.link},refetchQueries:[{query:getWebsites}]})

                            resetForm();
                            // setCurrentId(null);
                        }}>

                        {(formik: any) => (
                            <Form onSubmit={formik.handleSubmit}>
                                <Grid container justify="center">
                                    <Grid item xs={12} sm={6}>
                                        <div>
                                            <Field
                                                type='name'
                                                as={TextField}
                                                variant="outlined"
                                                label="Website Name"
                                                name="name"
                                                id="name"
                                                className={classes.textField}
                                            />
                                            <br />
                                            <ErrorMessage name='name' render={(msg: string) => (
                                                <span style={{ color: "red", fontSize: '18sp' }}>{msg}</span>
                                            )} />
                                            <br />
                                        </div>
                                        <div>
                                            <Field
                                                type='link'
                                                as={TextField}
                                                variant="outlined"
                                                label="Website URL"
                                                name="link"
                                                id="link"
                                                className={classes.textField}
                                            />
                                            <br />
                                            <ErrorMessage name='link' render={(msg: string) => (
                                                <span style={{ color: "red", fontSize: '18sp' }}>{msg}</span>
                                            )} />
                                            <br />
                                        </div>

                                        <div>
                                            <Button variant="contained" color="primary" type="submit" className={classes.textField} >
                                                Add Todo
                                        </Button>
                                        </div>
                                    </Grid>
                                </Grid>
                            </Form>
                        )}

                    </Formik>
                </div>
            </div>
            <div>
                {loading && <CircularProgress />}
                {data &&
                    <Grid container justify="center">
                        <Grid item xs={12} sm={6}>
                            {
                                <List>
                                    {data.websites.map(web => (
                                        <ListItem key={web.id} className={classes.dataDisplay}>
                                            <ListItemText
                                                primary={web.name}
                                                secondary={
                                                    <React.Fragment>
                                                        <a href={web.link}>{web.link}</a>
                                                    </React.Fragment>
                                                }
                                            />
                                            <ListItemSecondaryAction>
                                                <Modal
                                                    open={open}
                                                    onClose={handleClose}
                                                    aria-labelledby="simple-modal-title"
                                                    aria-describedby="simple-modal-description"
                                                >
                                                    <div style={modalStyle} className={classes.paper}>
                                                        <Formik
                                                            initialValues={{ name: currentName, link: currentLink }}
                                                            validationSchema={schema}
                                                            onSubmit={(value, { resetForm }) => {
                                                                console.log('name', value.name)
                                                                console.log('link', value.link)

                                                                resetForm();
                                                                handleClose();
                                                            }}>

                                                            {(formik: any) => (
                                                                <Form onSubmit={formik.handleSubmit}>
                                                                    <Grid container justify="center">
                                                                        <Grid item xs={12}>
                                                                            <div>
                                                                                <Field
                                                                                    type='name'
                                                                                    as={TextField}
                                                                                    variant="outlined"
                                                                                    label="Website Name"
                                                                                    name="name"
                                                                                    id="name"
                                                                                    className={classes.textField}
                                                                                />
                                                                                <br />
                                                                                <ErrorMessage name='name' render={(msg: string) => (
                                                                                    <span style={{ color: "red", fontSize: '18sp' }}>{msg}</span>
                                                                                )} />
                                                                                <br />
                                                                            </div>
                                                                            <div>
                                                                                <Field
                                                                                    type='link'
                                                                                    as={TextField}
                                                                                    variant="outlined"
                                                                                    label="Website URL"
                                                                                    name="link"
                                                                                    id="link"
                                                                                    className={classes.textField}
                                                                                />
                                                                                <br />
                                                                                <ErrorMessage name='link' render={(msg: string) => (
                                                                                    <span style={{ color: "red", fontSize: '18sp' }}>{msg}</span>
                                                                                )} />
                                                                                <br />
                                                                            </div>

                                                                            <div>
                                                                                <Button variant="contained" color="primary" type="submit" className={classes.textField} >
                                                                                    Update Bookmark
                                                                                </Button>
                                                                            </div>
                                                                        </Grid>
                                                                    </Grid>
                                                                </Form>
                                                            )}

                                                        </Formik>
                                                    </div>
                                                </Modal>
                                                <IconButton edge="end" aria-label="delete" onClick={() => {
                                                    console.log('Update Button', web.id);
                                                    setCurrentId(web.id)
                                                    setCurrentName(web.name)
                                                    setCurrentLink(web.link)
                                                    handleOpen()
                                                }}>
                                                    <CreateOutlinedIcon />
                                                </IconButton>
                                                <IconButton edge="end" aria-label="delete" onClick={async () => {
                                                    // deleteTodo({
                                                    //     variables:{
                                                    //         id:todo.id
                                                    //     },
                                                    //     refetchQueries: [{ query: getTodos }],
                                                    // })
                                                    // Swal.fire({
                                                    //     position: 'center',
                                                    //     icon: 'success',
                                                    //     title: 'A todo is deleted',
                                                    //     showConfirmButton: false,
                                                    //     timer: 1500
                                                    //   })
                                                }}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>

                                        </ListItem>
                                    ))}
                                </List>
                            }
                        </Grid>
                    </Grid>
                }
                {error && <p>Error fetching data</p>}
            </div>

        </div>

    );
}

export default Websites;