import { Typography, Button, AppBar, Card, CardActions, CardContent, CardMedia, CssBaseline, Grid, Toolbar, Container} from '@mui/material';
import { Campaign } from '@mui/icons-material';
import './App.css';

export const cardList =[1, 2, 3, 4, 5, 6]

export const ApproveProcess = () => {
  return(
<>
<CssBaseline />
      <AppBar position="relative">
        <Toolbar className='header-bar'>
          <Campaign className='headerBar-icon'/>
          <Typography variant="h6">Request approval</Typography>
        </Toolbar>
      </AppBar>

      <main>
        <div className='container'>
          <Container maxWidth="sm">
            <Typography variant='h4' align='center' color='textPrimary' gutterBottom>
              Request wait to be approved
            </Typography>
          </Container>
        </div>
        <Container className='card-grid' maxWidth='md'>
          <Grid container spacing={4}>
            {cardList.map((card) => (
              <Grid item key={card} xs={12} sm={6} md={6}>
                <Card className='card'>
                  <CardContent className='card-content'>
                    <Typography gutterBottom variant="h5">
                      Create Secret
                    </Typography>
                    <Typography>
                      Show secret description here
                    </Typography>
                    <div className='employee-detail'>
                      <Typography className='employee-detail' color='textSecondary'>
                        From: Nguyen Van A 
                      </Typography>
                      <Typography color='textSecondary'>
                        Role: Developer
                      </Typography>
                    </div>
                  </CardContent>
                  <div className='center'>

                  </div>
                  <CardActions className='card-actions'>
                    <Button size='small' color='success' className='card-btn'>Accept</Button>
                    <Button size='small' color='error' className='card-btn'>Reject</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </main>
</>
      
 
  );
}